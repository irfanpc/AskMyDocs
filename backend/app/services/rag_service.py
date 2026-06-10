import os
from typing import List, Dict, Any
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores.supabase import SupabaseVectorStore
from supabase.client import create_client, Client
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain_google_genai import GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.documents import Document
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser

from app.config import settings

# Initialize Supabase client
supabase: Client = create_client(settings.supabase_url, settings.supabase_service_key)

def get_embeddings():
    if settings.llm_provider.lower() == "openai":
        return OpenAIEmbeddings(openai_api_key=settings.openai_api_key)
    else:
        return GoogleGenerativeAIEmbeddings(
            google_api_key=settings.gemini_api_key, 
            model="models/gemini-embedding-001"
        )

def get_llm():
    if settings.llm_provider.lower() == "openai":
        return ChatOpenAI(openai_api_key=settings.openai_api_key, model="gpt-4o-mini", temperature=0)
    else:
        return ChatGoogleGenerativeAI(
            google_api_key=settings.gemini_api_key, 
            model="gemini-2.5-flash", 
            temperature=0,
            max_retries=1
        )

def get_vector_store():
    embeddings = get_embeddings()
    return SupabaseVectorStore(
        client=supabase,
        embedding=embeddings,
        table_name="documents",
        query_name="match_documents"
    )

def add_documents_to_vector_store(text: str, source_filename: str):
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200,
        length_function=len
    )
    chunks = text_splitter.split_text(text)
    
    documents = [
        Document(page_content=chunk, metadata={"source": source_filename})
        for chunk in chunks
    ]
    
    vector_store = get_vector_store()
    vector_store.add_documents(documents)

def get_all_documents() -> List[str]:
    # Fetch all metadata from Supabase to extract unique sources
    response = supabase.table("documents").select("metadata").execute()
    sources = set()
    for row in response.data:
        md = row.get("metadata", {})
        if md and "source" in md:
            sources.add(md["source"])
    return list(sources)

def delete_document(filename: str):
    # Safely fetch IDs matching the filename and delete them
    response = supabase.table("documents").select("id, metadata").execute()
    ids_to_delete = [
        row["id"] for row in response.data 
        if row.get("metadata", {}).get("source") == filename
    ]
    
    if ids_to_delete:
        # Supabase API 'in_' requires a list of strings/ints
        supabase.table("documents").delete().in_("id", ids_to_delete).execute()
    
def answer_question(query: str, history: List[Dict[str, str]] = None) -> Dict[str, Any]:
    if not get_all_documents():
        return {
            "answer": "Please upload a document first. Once the document is uploaded, I will answer your questions based on its contents.",
            "sources": []
        }

    vector_store = get_vector_store()
    retriever = vector_store.as_retriever(search_type="similarity", search_kwargs={"k": 4})
    llm = get_llm()

    system_prompt = (
        "You are an AI assistant designed to answer questions based *only* on the provided context. "
        "If the information is not present in the context, do not attempt to guess or use outside knowledge. "
        "Instead, respond exactly with: 'The uploaded documents do not contain information about this topic.'\n"
        "IMPORTANT: Do NOT start your answer with 'Based on the provided documents'. Just answer the question directly. "
        "Then, on a new line at the very end of your response, append the exact phrase: '*Based on the provided documents.*'\n\n"
        "Context:\n{context}"
    )

    prompt = ChatPromptTemplate.from_messages([
        ("system", system_prompt),
        ("human", "{input}"),
    ])

    # 1. Retrieve documents once
    docs = retriever.invoke(query)
    
    # 2. Extract sources
    sources = []
    for doc in docs:
        source = doc.metadata.get("source", "Unknown")
        if source not in sources:
            sources.append(source)
            
    # 3. Format context string
    def format_docs(docs):
        return "\n\n".join(doc.page_content for doc in docs)
        
    context_str = format_docs(docs)

    # 4. Invoke LLM with pre-fetched context
    chain = prompt | llm | StrOutputParser()
    answer = chain.invoke({
        "context": context_str,
        "input": query
    })
    
    return {
        "answer": answer,
        "sources": sources
    }
