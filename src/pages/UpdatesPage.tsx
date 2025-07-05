import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { updatesList, loadMarkdownContent, UpdateInfo } from "../data/updates";

const UpdatesPage: React.FC = () => {
  const [openId, setOpenId] = useState<number | null>(null);
  const [markdownContent, setMarkdownContent] = useState<{ [key: number]: string }>({});
  const [loadingIds, setLoadingIds] = useState<Set<number>>(new Set());

  const handleToggle = async (update: UpdateInfo) => {
    const newOpenId = openId === update.id ? null : update.id;
    setOpenId(newOpenId);

    // Load markdown content if not already loaded
    if (newOpenId && !markdownContent[update.id] && !loadingIds.has(update.id)) {
      setLoadingIds(prev => new Set(prev).add(update.id));
      
      try {
        const content = await loadMarkdownContent(update.fileName);
        setMarkdownContent(prev => ({
          ...prev,
          [update.id]: content
        }));
      } catch (error) {
        console.error("Error loading markdown:", error);
        setMarkdownContent(prev => ({
          ...prev,
          [update.id]: `# Lỗi\n\nKhông thể tải nội dung cho ${update.title}`
        }));
      } finally {
        setLoadingIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(update.id);
          return newSet;
        });
      }
    }
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 p-6 border-b border-slate-700">
        <h2 className="text-2xl font-bold text-yellow-400 text-center">
          Lịch sử cập nhật
        </h2>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-6">
        <div className="max-w-4xl mx-auto space-y-4">
          {updatesList.map(update => (
            <div key={update.id} className="border border-slate-700 rounded-lg bg-slate-800/70 shadow-lg">
              <button
                className="w-full flex justify-between items-center px-6 py-4 text-left focus:outline-none focus:bg-slate-700 rounded-t-lg hover:bg-slate-700/50 transition-colors"
                onClick={() => handleToggle(update)}
              >
                <div className="flex-1">
                  <span className="font-semibold text-slate-200 text-lg">
                    {update.title}
                  </span>
                  <div className="text-sm text-slate-400 mt-1">
                    Cập nhật: {new Date(update.date).toLocaleDateString('vi-VN')}
                  </div>
                </div>
                <span 
                  className={`ml-4 transition-transform duration-200 text-yellow-400 ${
                    openId === update.id ? 'rotate-90' : ''
                  }`}
                >
                  ▶
                </span>
              </button>
              
              {openId === update.id && (
                <div className="border-t border-slate-700 bg-slate-900/80 rounded-b-lg">
                  <div className="p-6">
                    {loadingIds.has(update.id) ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
                        <span className="ml-3 text-slate-300">Đang tải...</span>
                      </div>
                    ) : (
                      <div className="prose prose-invert prose-yellow max-w-none">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            h1: ({ children }) => (
                              <h1 className="text-2xl font-bold text-yellow-400 mb-4 border-b border-slate-600 pb-2">
                                {children}
                              </h1>
                            ),
                            h2: ({ children }) => (
                              <h2 className="text-xl font-semibold text-slate-200 mb-3 mt-6">
                                {children}
                              </h2>
                            ),
                            h3: ({ children }) => (
                              <h3 className="text-lg font-semibold text-slate-300 mb-2 mt-4">
                                {children}
                              </h3>
                            ),
                            p: ({ children }) => (
                              <p className="text-slate-300 mb-3 leading-relaxed">
                                {children}
                              </p>
                            ),
                            ul: ({ children }) => (
                              <ul className="list-disc list-inside text-slate-300 mb-3 space-y-1">
                                {children}
                              </ul>
                            ),
                            ol: ({ children }) => (
                              <ol className="list-decimal list-inside text-slate-300 mb-3 space-y-1">
                                {children}
                              </ol>
                            ),
                            li: ({ children }) => (
                              <li className="text-slate-300 leading-relaxed">
                                {children}
                              </li>
                            ),
                            strong: ({ children }) => (
                              <strong className="text-yellow-400 font-semibold">
                                {children}
                              </strong>
                            ),
                            code: ({ children }) => (
                              <code className="bg-slate-800 text-yellow-300 px-2 py-1 rounded text-sm">
                                {children}
                              </code>
                            ),
                            pre: ({ children }) => (
                              <pre className="bg-slate-800 text-slate-300 p-4 rounded-lg overflow-x-auto mb-4">
                                {children}
                              </pre>
                            ),
                            blockquote: ({ children }) => (
                              <blockquote className="border-l-4 border-yellow-400 pl-4 italic text-slate-400 mb-4">
                                {children}
                              </blockquote>
                            )
                          }}
                        >
                          {markdownContent[update.id] || ""}
                        </ReactMarkdown>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UpdatesPage;