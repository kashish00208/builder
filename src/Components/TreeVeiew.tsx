import { TreeNode } from "@/types";
const TreeView = ({
  nodes,
  onFileClick,
  selectedFile,
}: {
  nodes: TreeNode[];
  onFileClick: (file: TreeNode) => void;
  selectedFile: string;
}) => {
  return (
    <ul className="ml-1 space-y-1">
      {nodes.map((node) => (
        <li key={node.path}>
          {node.type === "folder" ? (
            <details open>
              <summary className="text-gray-400 cursor-pointer text-sm">
                {node.name}
              </summary>
              <TreeView
                nodes={node.children || []}
                onFileClick={onFileClick}
                selectedFile={selectedFile}
              />
            </details>
          ) : (
            <button
              onClick={() => onFileClick(node)}
              className={`block w-full text-left text-sm px-2 py-1 rounded ${
                selectedFile === node.path
                  ? "bg-[#094771] text-white"
                  : "hover:bg-[#333] text-gray-300"
              }`}
            >
              {node.name}
            </button>
          )}
        </li>
      ))}
    </ul>
  );
};

export default TreeView;