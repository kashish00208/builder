"use client";
import React, { useState, useRef, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { FaArrowRight } from "react-icons/fa";
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

const ChatAI = () => {
  const [inputPrompt, setinputPrompt] = useState("");
  const [chatMsgs, setchatMsgs] = useState<{ sender: string; text: string }[]>(
    []
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const msgEnding = useRef<HTMLDivElement | null>(null);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isPreviewing, setIsPreviewing] = useState(false);

  const [chatWidth, setChatWidth] = useState(40);

  const isDragging = useRef(false);

  const minWidth = 20;
  const maxxWidth = 80;

  const [steps, setSteps] = useState<Step[]>([]);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [fileContent, setFileContent] = useState("");
  const [selectedFile, setSelectedFile] = useState("");
  const [webcontainer, setWebcontainer] = useState<WebContainer | null>(null);

  const [language, setLanguage] = useState("plaintext");

  const searchParams = useSearchParams();
  const fileTree = buildFileTree(files);

  const hasSentInitialPromptRef = useRef(false);
  console.log(steps);
  const handleFileClick = (filePath: string) => {
    const file = files.find((f) => f.path === filePath);
    if (file) {
      setSelectedFile(file.path);
      setFileContent(file.content || "// No content");
      setLanguage(getLanguageFromExtension(file.name));
    } else {
      setFileContent("// File not found");
    }
  };

  async function getAppType(prompt: string) {
    const response = await fetch(`${process.env.NEXT_API_URL}/appType`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt: inputPrompt }),
    });
    console.log(prompt);
    const data = await response.json();

    const appType = data.type;

    console.log("Suggested app type:", appType);

    return appType;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setinputPrompt(e.target.value);
  };

  const sendMessage = async (inputPrompt: string) => {
    console.log(process.env.BACKEND_URL);
    if (!inputPrompt.trim()) return;

    setLoading(true);
    setError("");

    const userMessage = { sender: "user", text: inputPrompt };
    setchatMsgs((prev) => [...prev, userMessage]);

    try {
      const res = await fetch(`${process.env.NEXT_API_URL}/template`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: inputPrompt }),
      });

      if (!res.ok) {
        console.error("Error occurred while generating response");
        setError("Failed to fetch response from server.");
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

      setLoading(true);

      const results = parseXml(prompts[1]);

      const generatedFiles: FileItem[] = results.map((item: any) => ({
        name: item.path,
        type: "file",
        path: item.path,
        content: item.content,
      }));

      setFiles(generatedFiles);
      console.log(generatedFiles);
      const filesRespose = await fetch(`${process.env.NEXT_API_URL}/chat`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          messages: [...prompts, inputPrompt].map((content) => ({
            role: "user",
            content,
          })),
        }),
      });

      const dataofallfiles = await filesRespose.json();
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

        setFiles(matchedFiles);
        console.log("Matched files it is ", matchedFiles);

        handlePreviewClick();
      }
    } catch (err) {
      console.error("Error:", err);
      setError("Something went wrong while sending the message.");
    } finally {
      setLoading(false);
      setinputPrompt("");
    }
  };
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputPrompt.trim();
    if (!trimmed) {
      return;
    }
    await sendMessage(trimmed);
    setinputPrompt("");
  };

  useEffect(() => {
    msgEnding.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMsgs]);

  useEffect(() => {
    const initialPrompt = searchParams.get("prompt");
    if (initialPrompt && !hasSentInitialPromptRef.current) {
      hasSentInitialPromptRef.current = true;
      sendMessage(initialPrompt);
      setinputPrompt("");
    }
  }, [searchParams]);

  const handlePreviewClick = async () => {
    if (files.length === 0) return; // nothing to preview
    setIsPreviewing(true);
    setError("");

    try {
      let wc = webcontainer;
      if (!wc) {
        wc = await getWebContainerInstance();
        setWebcontainer(wc);
      }

      const fileMap = toWebContainerMount(files);
      await wc.mount(fileMap);

      const installProcess = await wc.spawn("npm", ["install"]);
      installProcess.output.pipeTo(
        new WritableStream({
          write(data) {
            const text =
              typeof data === "string" ? data : new TextDecoder().decode(data);
            console.log("[install]", text.replace(/\x1B\[.*?m/g, "").trim());
          },
        })
      );
      await installProcess.exit;
      console.log("✅ npm install finished");

      const projectType = await getAppType(inputPrompt);
      const isReactApp = projectType === "react";
      const devCommand = isReactApp ? ["run", "dev"] : ["start"];

      const devProcess = await wc.spawn("npm", devCommand);
      devProcess.output.pipeTo(
        new WritableStream({
          write(data) {
            const text =
              typeof data === "string" ? data : new TextDecoder().decode(data);
            console.log("[dev]", text.replace(/\x1B\[.*?m/g, "").trim());
          },
        })
      );

      const port = isReactApp ? 5173 : 3000;

      const previewUrl = `https://webcontainer.localhost:${port}`;
      setPreviewUrl(previewUrl);
      console.log("🚀 Preview ready at iframe:", previewUrl);
    } catch (err) {
      console.error(err);
      setError("Failed to launch preview.");
    } finally {
      setIsPreviewing(false);
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      // as percent
      const netWidth = (e.clientX / window.innerWidth) * 100;
      if (netWidth >= minWidth && netWidth <= maxxWidth) {
        setChatWidth(netWidth);
      }
    };

    const stopDragging = () => {
      isDragging.current = false;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", stopDragging);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", stopDragging);
    };
  }, []);

  const handleDownloadZip = () => {};

  return (
    <div className="h-screen w-screen flex flex-col bg-[#1e1e1e] text-gray-100">
      <div className="flex justify-between items-center p-4 border-b border-gray-700 bg-[#1f1f1f] shadow-sm rounded-t-lg">
        <div className="text-xl font-semibold text-white">Builder</div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleDownloadZip}
            className="px-4 py-2 rounded-md bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors duration-200"
          >
            Download Zip
          </button>
          <button
            onClick={handlePreviewClick}
            disabled={isPreviewing || files.length === 0}
            className={`px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-medium transition-colors duration-200 ${
              isPreviewing
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-blue-700"
            }`}
          >
            {isPreviewing ? "Launching Preview..." : "Preview Project"}
          </button>
        </div>
      </div>

      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* File Explorer */}
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

        {/* File content and preview */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <div className="flex-1 flex overflow-hidden">
            <div className="flex-1 overflow-y-auto p-4">
              {previewUrl && (
                <div className="mb-4">
                  <h3 className="text-white font-semibold mb-2">
                    Live Preview
                  </h3>
                  <iframe
                    src={previewUrl}
                    sandbox="allow-scripts allow-same-origin"
                    className="w-full h-[400px] border border-gray-600 rounded"
                    title="Live Preview"
                  />
                </div>
              )}
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
                {fileContent}
              </SyntaxHighlighter>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatAI;
