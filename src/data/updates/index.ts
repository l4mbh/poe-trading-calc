// Import all markdown files at build time
import update1 from './update-1.md?raw';
import update2 from './update-2.md?raw';
import update3 from './update-3.md?raw';
import update4 from './update-4.md?raw';
import update5 from './update-5.md?raw';

export interface UpdateInfo {
  id: number;
  title: string;
  date: string;
  fileName: string;
}

export const updatesList: UpdateInfo[] = [
  {
    id: 1,
    title: "🆕 Widget tỷ giá & lợi nhuận trên menu chính",
    date: "2024-01-15",
    fileName: "update-1.md"
  },
  {
    id: 2,
    title: "🔄 Tỷ giá tự động & chọn league",
    date: "2024-01-10",
    fileName: "update-2.md"
  },
  {
    id: 3,
    title: "📊 Thống kê nâng cao & hiển thị Divine",
    date: "2024-01-05",
    fileName: "update-3.md"
  },
  {
    id: 4,
    title: "🎨 Giao diện hiện đại, tối ưu mobile",
    date: "2024-01-01",
    fileName: "update-4.md"
  },
  {
    id: 5,
    title: "💾 Lưu trữ & xuất nhập dữ liệu an toàn",
    date: "2023-12-28",
    fileName: "update-5.md"
  }
];

// Mapping of file names to their content
const markdownFiles: { [key: string]: string } = {
  'update-1.md': update1,
  'update-2.md': update2,
  'update-3.md': update3,
  'update-4.md': update4,
  'update-5.md': update5,
};

// Function to load markdown content
export const loadMarkdownContent = async (fileName: string): Promise<string> => {
  try {
    const content = markdownFiles[fileName];
    if (!content) {
      throw new Error(`File ${fileName} not found`);
    }
    return content;
  } catch (error) {
    console.error(`Error loading markdown file ${fileName}:`, error);
    return `# Lỗi\n\nKhông thể tải nội dung cho ${fileName}`;
  }
}; 