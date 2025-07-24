import ChatAI from '@/Components/ChatAI';
import CodeEditor from '@/Components/Editor';

const Page = () => {
  return (
    <div className="h-screen pt-20 px-6 pb-4 border-gray-700">
      <div className="flex h-full gap-4">
        <div className="w-2/5 rounded-lg shadow-md p-4 overflow-hidden">
          <ChatAI />
        </div>
        <div className="w-3/5 border border-gray-700 rounded-lg shadow-md p-4 overflow-hidden">
          <CodeEditor />
        </div>
      </div>
    </div>
  );
};

export default Page;