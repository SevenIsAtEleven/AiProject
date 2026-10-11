from flask import Flask, render_template, request, jsonify
from openai import OpenAi

app = Flask(__name__)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/chat", methods=["POST"])
def chat():
    data = request.get_json()
    user_message = data.get("message", " ")

    reply = "big big big"

    return jsonify({"reply": reply})

if __name__ == "__main__":
    app.run(debug=True)