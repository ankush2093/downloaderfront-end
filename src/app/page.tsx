"use client";
import { useState } from "react";

export default function Home() {
  const [link, setLink] = useState("");
  const [platform, setPlatform] = useState("youtube");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [downloadUrl, setDownloadUrl] = useState("");
  const [progress, setProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Added for loading

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setDownloadUrl("");
    setProgress(0);
    setIsLoading(true); // Start loading

    try {
      const response = await fetch("https://downlaoderbackend.onrender.com/api/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ link, platform }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage("Download is ready!");
        //setDownloadUrl(`https://downlaoderbackend.onrender.com${data.fileUrl}`);
        setDownloadUrl(`https://downlaoderbackend.onrender.com${data.fileUrl}`);
      } else {
        setError(data.error || "An error occurred.");
      }
    } catch (err) {
      setError("Failed to connect to the server.");
    } finally {
      setIsLoading(false); // Stop loading
    }
  };

  const handleDownload = async () => {
    if (!downloadUrl) return;
  
    setIsDownloading(true);
    setProgress(0);
  
    try {
      const response = await fetch(downloadUrl);
      if (!response.ok) throw new Error("Failed to download");
  
      const reader = response.body?.getReader();
      const contentLength = +response.headers.get("Content-Length")!;
  
      let receivedLength = 0;
      const chunks = [];
  
      while (true) {
        const { done, value } = await reader!.read();
        if (done) break;
        chunks.push(value);
        receivedLength += value.length;
        setProgress(Math.round((receivedLength / contentLength) * 100));
      }
  
      const blob = new Blob(chunks);
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "video.mp4";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  
      setTimeout(() => setDownloadUrl(""), 2000);
    } catch (err) {
      setError("Download failed.");
    } finally {
      setIsDownloading(false);
    }
  };
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Video Downloader</h1>

      <form onSubmit={handleSubmit} className="mb-4">
        <label className="block text-gray-700 font-bold mb-2">Platform:</label>
        <select
          value={platform}
          onChange={(e) => setPlatform(e.target.value)}
          className="w-full border rounded px-3 py-2 mb-2"
        >
          <option value="youtube">YouTube</option>
          <option value="instagram">Instagram</option>
        </select>

        <input
          type="text"
          placeholder="Enter video link"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          className="w-full border rounded px-3 py-2 mb-2"
        />
        <button 
          className="bg-blue-500 text-white font-bold py-2 px-4 rounded"
          disabled={isLoading} // Disable button when loading
        >
          {isLoading ? "Loading..." : "Download"}
        </button>
      </form>

      {error && <p className="text-red-500">{error}</p>}
      {message && <p className="text-green-500">{message}</p>}

      {isDownloading && (
        <div className="w-full bg-gray-300 h-4 rounded mt-2">
          <div
            className="bg-green-500 h-4 rounded"
            style={{ width: `${progress}%` }}
          ></div>
          <p className="text-center text-sm mt-1">{progress}% Downloaded</p>
        </div>
      )}

      {downloadUrl && !isDownloading && (
        <button
          onClick={handleDownload}
          className="bg-green-500 text-white font-bold py-2 px-4 rounded"
          disabled={isDownloading} // Disable while downloading
        >
          {isDownloading ? "Downloading..." : "Click to Download"}
        </button>
      )}
    </div>
  );
}
