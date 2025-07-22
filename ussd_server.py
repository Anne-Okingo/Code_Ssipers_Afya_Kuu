from flask import Flask, request
from ml_model import predict_from_input

app = Flask(__name__)

# Store session data in memory (reset if server restarts)
session_store = {}

# Define the list of questions and the keys they map to
questions = [
    ("Welcome To Afya Kuu \n Enter your age:", "Age"),
    ("Number of sexual partners:", "Sexual Partners"),
    ("Age of first sexual activity:", "First Sexual Activity Age"),
    ("HPV Test Result? (1=POSITIVE, 2=NEGATIVE):", "HPV Test Result"),
    ("Pap Smear Result? (1=YES, 2=NO):", "Pap Smear Result"),
    ("Smoking Status? (1=YES, 2=NO):", "Smoking Status"),
    ("STDs History? (1=YES, 2=NO):", "STDs History"),
    ("Region (e.g., Mombasa, Kisumu, Nairobi):", "Region"),
    ("Insurance Covered? (1=YES, 2=NO):", "Insurance Covered"),
    ("Last Screening Type (VIA, PAP, HPV):", "Screening Type Last")
]

def validate_input(step, value):
    """Validate user input based on the current step"""
    if step == 0:  # Age
        try:
            age = int(value)
            return 10 <= age <= 100
        except ValueError:
            return False
    elif step in [1, 2]:  # Sexual partners, First sexual activity age
        try:
            num = int(value)
            return num >= 0
        except ValueError:
            return False
    elif step in [3, 4, 5, 6, 8]:  # Binary choices
        return value in ["1", "2"]
    elif step == 7:  # Region
        return len(value.strip()) > 0
    elif step == 9:  # Screening type
        return len(value.strip()) > 0
    return True

@app.route("/ussd", methods=["POST"])
def ussd():
    session_id = request.form.get("sessionId")
    text = request.form.get("text", "")

    inputs = text.split("*") if text else []
    step = len(inputs)

    # Initialize session if new
    if session_id not in session_store:
        session_store[session_id] = {}

    # Validate previous input if not on first step
    if step > 0 and step <= len(questions):
        last_input = inputs[-1].strip()
        if not validate_input(step - 1, last_input):
            # Return error message and ask again
            prompt, _ = questions[step - 1]
            return f"CON Invalid input. {prompt}", 200, {"Content-Type": "text/plain"}

    if step < len(questions):
        # Ask the next question
        prompt, key = questions[step]
        return f"CON {prompt}", 200, {"Content-Type": "text/plain"}
    else:
        try:
            # Collect answers
            for i, (_, key) in enumerate(questions):
                if i < len(inputs):
                    value = inputs[i].strip()
                    if key in ["HPV Test Result", "Pap Smear Result", "Smoking Status", "STDs History", "Insurance Covered"]:
                        value = "POSITIVE" if value == "1" else "NEGATIVE" if key == "HPV Test Result" else "YES" if value == "1" else "NO"
                    session_store[session_id][key] = value
                else:
                    # Handle missing inputs
                    session_store[session_id][key] = "0" if key != "Region" and key != "Screening Type Last" else "UNKNOWN"

            # Predict and return result
            prediction = predict_from_input(session_store[session_id])
            del session_store[session_id]  # clear after use
            return f"END {prediction}", 200, {"Content-Type": "text/plain"}
        
        except Exception as e:
            # Clean up session and return error message
            if session_id in session_store:
                del session_store[session_id]
            print(f"Error processing USSD request: {str(e)}")
            return f"END Service temporarily unavailable. Please try again later.", 200, {"Content-Type": "text/plain"}

if __name__ == "__main__":
    app.run(debug=True, port=5000)