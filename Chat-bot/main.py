from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import google.generativeai as genai
gemini_api_key = "AIzaSyC2P0cST5Nd72EvOvUffIYJaDddjXyvirw"


app = FastAPI()

# Configure CORS
origins = [
    "http://localhost:3000",  # Default React port
    "http://localhost:8000",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:8000",
    "http://localhost:5173",  # Vite default port
    "*"  # During development only - remove in production
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

genai.configure(api_key=gemini_api_key)

# Set up the model
generation_config = {
    "temperature": 1,
    "top_p": 0.95,
    "top_k": 0,
    "max_output_tokens": 8192,
}

safety_settings = [
    {
        "category": "HARM_CATEGORY_HARASSMENT",
        "threshold": "BLOCK_MEDIUM_AND_ABOVE"
    },
    {
        "category": "HARM_CATEGORY_HATE_SPEECH",
        "threshold": "BLOCK_MEDIUM_AND_ABOVE"
    },
    {
        "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT",
        "threshold": "BLOCK_MEDIUM_AND_ABOVE"
    },
    {
        "category": "HARM_CATEGORY_DANGEROUS_CONTENT",
        "threshold": "BLOCK_MEDIUM_AND_ABOVE"
    },
]
system_instruction = (
    "You are an AI assistant for QuantumSafeNet, a secure and AI-driven virtual network solution for remote access. "
    "Your role is to provide professional support to users, offering insights on secure remote access, encryption, AI-based threat detection, "
    "post-quantum cryptography, geo-location filtering, and blockchain-based secure audits. If you do not have sufficient information to answer a user's question, "
    "please respond with 'I don't know.' Always maintain a professional and helpful tone. "
    "When responding to a user query, structure your response as valid, semantic HTML. Use appropriate tags like <p> for paragraphs, <strong> for bold text, "
    "<em> for italic text, <ul>/<li> for lists, and <a> for links. Ensure the HTML is well-formed and ready to be rendered directly on a webpage. "
    "Responses should not contain raw formatting characters like *, _, or \\n. "
    "Line breaks should only be represented by semantic HTML tags such as <br> or the appropriate paragraph structure. "
    "Your responses should be concise, user-friendly, and visually organized when rendered as HTML."
)

model = genai.GenerativeModel(model_name="gemini-1.5-pro-latest",
                              generation_config=generation_config,
                              system_instruction=system_instruction,
                              safety_settings=safety_settings)

convo = model.start_chat(history=[])


@app.get("/")
def chat(message: str):
    convo.send_message(message)
    response = convo.last.text
    html_response = response.replace('* ', '')

    return html_response


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
