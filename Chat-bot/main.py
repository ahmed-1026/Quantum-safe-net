from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from qdrant_client import QdrantClient
from sentence_transformers import SentenceTransformer
from openai import OpenAI
import json

with open('config.json', 'r') as file:
    config = json.load(file)

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


qdrant_client = QdrantClient(
    url=config['qdrant_url'], 
    api_key=config['qdrant_api_key'],
)

client = OpenAI(
  base_url = "https://integrate.api.nvidia.com/v1",
  api_key = config["openai_api_key"]
)

def get_sentenceTF_embeddings(sentences):
  model = SentenceTransformer('all-MiniLM-L6-v2')
  embeddings =[]
  for chunk in sentences:
    embeddings.append(model.encode(chunk))
  print(len(embeddings))
  return embeddings

def custom_prompt(query: str, results):
    # Extract the page content from the results
    source_knowledge = "\n".join([x.payload['text'] for x in results])
    
    # Create the augmented prompt
    augment_prompt = f"""Using the contexts below, answer the query in short paragraph:

    Contexts:
    {source_knowledge}

    Query: {query}"""
    
    return augment_prompt

@app.get("/")
def chat(message: str):
    # print(message)
    query = [message]
    query_embedding_response = get_sentenceTF_embeddings(query)
    
    # Assuming query_embedding_response is a list of lists or a NumPy array
    query_embedding = query_embedding_response[0].tolist()  # Convert to list if necessary
    
    # print(qdrant_client.get_collections())

    # Perform similarity search
    results = qdrant_client.search(
        collection_name="quantumsafenetbot",
        query_vector=query_embedding,
    )
    
    messages = []
    # messages.append({"role":"assistant", "content": full_response})
    prompt = {"role":"system", "content": custom_prompt(query, results)}
    messages.append(prompt)

    res = client.chat.completions.create(
    model="meta/llama-3.1-8b-instruct",
    messages=messages,
    temperature=0.2,
    top_p=0.7,
    max_tokens=1024,
    stream=True
    )

    full_response = ""
    for chunk in res:
        if chunk.choices[0].delta.content is not None:
            full_response += chunk.choices[0].delta.content
    print(full_response)
    return full_response



if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
