"use client";
import React, { useState, useRef, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Step, FileItem } from "../types/index";
import { WebContainer } from "@webcontainer/api";
import { getWebContainerInstance } from "../utils/webcontainer";
import { parseXml } from "../steps";
import toWebContainerMount from "../utils/fileStructure";
import getLanguageFromExtension from "./Languatext";
import TreeView from "./TreeVeiew";
import buildFileTree from "./BuildTreee";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import JSZip from "jszip";
import { saveAs } from "file-saver";

const Chat = () => {
  const [inputPrompt, setinputPrompt] = useState("");
  const [chatMsgs, setchatMsgs] = useState<{ sender: string; text: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const msgEnding = useRef<HTMLDivElement | null>(null);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isPreviewing, setIsPreviewing] = useState(false);

  const [steps, setSteps] = useState<Step[]>([]);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [fileContent, setFileContent] = useState("");
  const [selectedFile, setSelectedFile] = useState("");
  const [webcontainer, setWebcontainer] = useState<WebContainer | null>(null);
  const [language, setLanguage] = useState("plaintext");

  const filesRef = useRef<FileItem[]>([]);

  const searchParams = useSearchParams();
  const fileTree = buildFileTree(files);
  const hasSentInitialPromptRef = useRef(false);

  const handleFileClick = (filePath: string) => {
    const file = filesRef.current.find((f) => f.path === filePath);
    if (file) {
      setSelectedFile(file.path);
      setFileContent(file.content || "// No content");
      setLanguage(getLanguageFromExtension(file.name));
    } else {
      setFileContent("// File not found");
    }
  };

  const updateFiles = (newFiles: FileItem[]) => {
    setFiles(newFiles);
    filesRef.current = newFiles;
  };

  async function getAppType(prompt: string): Promise<string> {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/appType`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      if (!response.ok) return "node";
      const data = await response.json();
      console.log("Suggested app type:", data.type);
      return data.type ?? "node";
    } catch {
      return "node";
    }
  }

  const handlePreviewClick = async (filesToMount?: FileItem[], promptOverride?: string) => {
    const currentFiles = filesToMount ?? filesRef.current;
    if (currentFiles.length === 0) return;

    setIsPreviewing(true);
    setError("");

    try {
      let wc = webcontainer;
      if (!wc) {
        wc = await getWebContainerInstance();
        setWebcontainer(wc);
      }

      const fileMap = toWebContainerMount(
        currentFiles.filter((f) => !f.path.endsWith(".d.ts"))
      ); await wc.mount(fileMap);

      const installProcess = await wc.spawn("npm", ["install"]);
      installProcess.output.pipeTo(
        new WritableStream({
          write(data) {
            const text = typeof data === "string" ? data : new TextDecoder().decode(data);
            console.log("[install]", text.replace(/\x1B\[.*?m/g, "").trim());
          },
        })
      );
      console.log(steps)
      await installProcess.exit;
      console.log("✅ npm install finished");

      const projectType = await getAppType(promptOverride ?? "");
      const devCommand = projectType === "react" ? ["run", "dev"] : ["start"];

      wc.on("server-ready", (port, url) => {
        console.log(`🚀 Preview ready at ${url} (port ${port})`);
        setPreviewUrl(url);
        setIsPreviewing(false);
      });

      const devProcess = await wc.spawn("npm", devCommand);
      devProcess.output.pipeTo(
        new WritableStream({
          write(data) {
            const text = typeof data === "string" ? data : new TextDecoder().decode(data);
            console.log("[dev]", text.replace(/\x1B\[.*?m/g, "").trim());
          },
        })
      );

    } catch (err) {
      console.error(err);
      setError("Failed to launch preview.");
      setIsPreviewing(false);
    }
  };

  const handleDownloadZip = async () => {
    const currentFiles = filesRef.current;
    if (currentFiles.length === 0) return;

    const zip = new JSZip();
    currentFiles.forEach((file) => {
      zip.file(file.path, file.content || "");
    });

    const blob = await zip.generateAsync({ type: "blob" });
    saveAs(blob, "project.zip");
  };

  const sendMessage = async (prompt: string) => {
    if (!prompt.trim()) return;

    setLoading(true);
    setError("");

    setchatMsgs((prev) => [...prev, { sender: "user", text: prompt }]);

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
      console.log("Backend URL:", backendUrl);

      const res = await fetch(`${backendUrl}/template`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (!res.ok) {
        const errorBody = await res.text();
        console.error("Server error:", res.status, res.statusText, errorBody);
        setError(`Server error ${res.status}: ${errorBody}`);
        return;
      }

      const data = await res.json();
      const { prompts } = data;

      setSteps(
        parseXml(prompts[1]).map((x: Step) => ({
          ...x,
          status: "pending",
        }))
      );

      const results = parseXml(prompts[1]);
      const generatedFiles: FileItem[] = results.map((item) => ({
        name: item.path ?? "",
        type: "file",
        path: item.path ?? "",
        content: item.content,
      }));

      updateFiles(generatedFiles);

      const filesResponse = await fetch(`${backendUrl}/chat`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          messages: [...prompts, prompt].map((content) => ({
            role: "user",
            content,
          })),
        }),
      });

      const dataofallfiles = await filesResponse.json();
      const finalPrompt = dataofallfiles.reply;

      if (finalPrompt) {
        const fileRegex =
          /<boltAction[^>]+filePath="([^"]+)"[^>]*>([\s\S]*?)<\/boltAction>/g;
        const matchedFiles: FileItem[] = [];

        let match;
        while ((match = fileRegex.exec(finalPrompt)) !== null) {
          const [, path, rawContent] = match;

          const folders = path.split("/");
          if (
            folders.some(
              (part) =>
                part.startsWith(".") && part !== folders[folders.length - 1]
            )
          ) {
            continue;
          }

          const content = rawContent
            .replace(/<br\s*\/?>/g, "\n")
            .replace(/&lt;/g, "<")
            .replace(/&gt;/g, ">")
            .replace(/&amp;/g, "&");

          matchedFiles.push({
            name: path.split("/").pop() || path,
            path,
            type: "file",
            content: content.trim(),
          });
        }

        updateFiles(matchedFiles);
        console.log("Matched files:", matchedFiles);

        handlePreviewClick(matchedFiles, prompt);
      }
    } catch (err) {
      console.error("Error:", err);
      setError("Something went wrong while sending the message.");
    } finally {
      setLoading(false);
      setinputPrompt("");
    }
  };

  useEffect(() => {
    msgEnding.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMsgs]);

  useEffect(() => {
    const initialPrompt = searchParams.get("prompt");
    if (initialPrompt && !hasSentInitialPromptRef.current) {
      hasSentInitialPromptRef.current = true;
      sendMessage(initialPrompt);
    }
  }, [searchParams,sendMessage]);

  return (
    <div className="h-screen w-screen flex flex-col bg-[#1e1e1e] text-gray-100">
      <div className="flex justify-between items-center p-4 border-b border-gray-700 bg-[#1f1f1f] shadow-sm">
        <div className="text-xl font-semibold text-white">Builder</div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleDownloadZip}
            disabled={files.length === 0}
            className="px-4 py-2 rounded-md bg-green-600 text-white text-sm font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            Download Zip
          </button>
          <button
            onClick={() => handlePreviewClick()}
            disabled={isPreviewing || files.length === 0}
            className={`px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-medium transition-colors duration-200 ${isPreviewing || files.length === 0
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-blue-700"
              }`}
          >
            {isPreviewing ? "Launching..." : "Preview Project"}
          </button>
        </div>
      </div>

      <div className="flex flex-1 min-h-0 overflow-hidden">
        <div className="w-64 bg-[#252526] border-r border-gray-700 p-4 flex-shrink-0 overflow-y-auto">
          <h3 className="text-sm font-bold text-gray-300 p-2 border-b border-gray-600">
            EXPLORER
          </h3>
          <TreeView
            nodes={fileTree}
            onFileClick={(file) => handleFileClick(file.path)}
            selectedFile={selectedFile}
          />
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4">
            {error && (
              <div className="mb-4 p-3 bg-red-900/50 border border-red-600 rounded text-red-300 text-sm">
                {error}
              </div>
            )}

            {/* Live preview */}
            {previewUrl && (
              <div className="mb-4">
                <h3 className="text-white font-semibold mb-2">Live Preview</h3>
                <iframe
                  src={previewUrl}
                  sandbox="allow-scripts allow-same-origin allow-forms allow-modals"
                  className="w-full h-[400px] border border-gray-600 rounded"
                  title="Live Preview"
                />
              </div>
            )}

            {/* Code viewer */}
            <SyntaxHighlighter
              language={language}
              style={vscDarkPlus}
              showLineNumbers
              wrapLongLines
              customStyle={{
                backgroundColor: "#1e1e1e",
                padding: "1rem",
                fontSize: "0.875rem",
              }}
            >
              {fileContent || "// Select a file from the explorer"}
            </SyntaxHighlighter>
          </div>

          <div className="border-t border-gray-700 p-4 bg-[#1f1f1f]">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputPrompt}
                onChange={(e) => setinputPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !loading && inputPrompt.trim()) {
                    sendMessage(inputPrompt);
                  }
                }}
                placeholder="Ask to modify the project..."
                className="flex-1 bg-[#2d2d2d] text-gray-100 border border-gray-600 rounded-md px-4 py-2 text-sm focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={() => sendMessage(inputPrompt)}
                disabled={loading || !inputPrompt.trim()}
                className={`px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-medium transition-colors duration-200 ${loading || !inputPrompt.trim()
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-blue-700"
                  }`}
              >
                {loading ? "Sending..." : "Send"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div ref={msgEnding} />
    </div>
  );
};

export default Chat;