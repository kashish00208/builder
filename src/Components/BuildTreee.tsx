import { FileItem , TreeNode } from "@/types";

const buildFileTree = (items: FileItem[] = []): TreeNode[] => {
  const root: TreeNode[] = [];

  const findOrCreate = (
    nodes: TreeNode[],
    name: string,
    path: string,
    type: "file" | "folder"
  ): TreeNode => {
    let node = nodes.find((n) => n.name === name && n.type === type);
    if (!node) {
      node = { name, path, type };
      if (type === "folder") node.children = [];
      nodes.push(node);
    }
    return node;
  };

  for (const item of items) {
    if (!item?.path || typeof item.path !== "string") {
      console.warn("Skipping invalid file item:", item);
      continue;
    }

    const parts = item.path.split("/");
    let currentLevel = root;
    let currentPath = "";

    for (let i = 0; i < parts.length; i++) {
      const isFile = i === parts.length - 1 && item.type === "file";
      currentPath = currentPath ? `${currentPath}/${parts[i]}` : parts[i];

      const node = findOrCreate(
        currentLevel,
        parts[i],
        currentPath,
        isFile ? "file" : "folder"
      );

      if (isFile) {
        node.content = item.content;
      } else {
        currentLevel = node.children!;
      }
    }
  }

  return root;
};


export default buildFileTree;