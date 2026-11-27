import 'dotenv/config';
import bcrypt from 'bcryptjs';
import {
  AvailabilityStatus,
  BorrowDetailStatus,
  ConditionStatus,
  FineReason,
  NotificationStatus,
  NotificationType,
  ReservationStatus,
  Role,
  SettingValueType,
  UserStatus,
} from '@prisma/client';
import { prisma } from '../src/database/prisma.client';

const STANDARD_SETTINGS: Array<{
  key: string;
  value: string;
  valueType: SettingValueType;
  description: string;
}> = [
  { key: 'STUDENT_MAX_BOOKS', value: '5', valueType: SettingValueType.NUMBER, description: 'Số sách tối đa sinh viên được mượn cùng lúc' },
  { key: 'STUDENT_LOAN_DAYS', value: '14', valueType: SettingValueType.NUMBER, description: 'Số ngày mượn tối đa cho sinh viên' },
  { key: 'STUDENT_MAX_RENEWALS', value: '1', valueType: SettingValueType.NUMBER, description: 'Số lần gia hạn tối đa cho sinh viên' },
  { key: 'LECTURER_MAX_BOOKS', value: '10', valueType: SettingValueType.NUMBER, description: 'Số sách tối đa giảng viên được mượn cùng lúc' },
  { key: 'LECTURER_LOAN_DAYS', value: '30', valueType: SettingValueType.NUMBER, description: 'Số ngày mượn tối đa cho giảng viên' },
  { key: 'LECTURER_MAX_RENEWALS', value: '2', valueType: SettingValueType.NUMBER, description: 'Số lần gia hạn tối đa cho giảng viên' },
  { key: 'FINE_PER_DAY', value: '5000', valueType: SettingValueType.NUMBER, description: 'Mức phạt trễ hạn mỗi ngày (VNĐ)' },
  { key: 'RESERVE_HOLD_DAYS', value: '3', valueType: SettingValueType.NUMBER, description: 'Số ngày giữ sách khi đặt trước sẵn sàng' },
  { key: 'REMIND_BEFORE_DAYS', value: '2', valueType: SettingValueType.NUMBER, description: 'Số ngày gửi email nhắc trước hạn trả' },
];

const CATEGORIES = [
  { name: 'Khoa học máy tính', slug: 'khoa-hoc-may-tinh', description: 'Lập trình, thuật toán, hệ điều hành, cơ sở dữ liệu và AI' },
  { name: 'Kỹ thuật phần mềm', slug: 'ky-thuat-phan-mem', description: 'Kiến trúc phần mềm, kiểm thử, DevOps và quản lý dự án' },
  { name: 'Toán học & Thống kê', slug: 'toan-hoc-thong-ke', description: 'Giải tích, đại số tuyến tính, xác suất và thống kê ứng dụng' },
  { name: 'Kinh tế & Quản trị', slug: 'kinh-te-quan-tri', description: 'Kinh tế học, tài chính, khởi nghiệp và quản trị doanh nghiệp' },
  { name: 'Văn học', slug: 'van-hoc', description: 'Văn học Việt Nam và văn học thế giới kinh điển' },
  { name: 'Lịch sử & Xã hội', slug: 'lich-su-xa-hoi', description: 'Lịch sử thế giới, lịch sử Việt Nam và xã hội học' },
  { name: 'Ngoại ngữ', slug: 'ngoai-ngu', description: 'Tiếng Anh học thuật, IELTS, TOEFL và ngôn ngữ chuyên ngành' },
  { name: 'Tâm lý & Kỹ năng', slug: 'tam-ly-ky-nang', description: 'Tâm lý học ứng dụng, tư duy phản biện và kỹ năng mềm' },
];

const AUTHORS = [
  { name: 'Robert C. Martin', nationality: 'Mỹ', birthYear: 1952, bio: 'Tác giả nổi tiếng với Clean Code và Clean Architecture' },
  { name: 'Martin Kleppmann', nationality: 'Anh', birthYear: 1984, bio: 'Nhà nghiên cứu hệ thống phân tán tại Đại học Cambridge' },
  { name: 'Thomas H. Cormen', nationality: 'Mỹ', birthYear: 1956, bio: 'Đồng tác giả cuốn Introduction to Algorithms (CLRS)' },
  { name: 'Martin Fowler', nationality: 'Anh', birthYear: 1963, bio: 'Chuyên gia về kiến trúc phần mềm và Refactoring' },
  { name: 'Eric Evans', nationality: 'Mỹ', birthYear: 1962, bio: 'Tác giả cuốn Domain-Driven Design' },
  { name: 'Andrew S. Tanenbaum', nationality: 'Mỹ', birthYear: 1944, bio: 'Giáo sư khoa học máy tính về Hệ điều hành và Mạng máy tính' },
  { name: 'Ian Goodfellow', nationality: 'Mỹ', birthYear: 1987, bio: 'Tác giả sách Deep Learning và người đề xuất GAN' },
  { name: 'Daniel Kahneman', nationality: 'Israel', birthYear: 1934, bio: 'Nhà tâm lý học đạt giải Nobel Kinh tế năm 2002' },
  { name: 'Yuval Noah Harari', nationality: 'Israel', birthYear: 1976, bio: 'Sử gia tác giả Sapiens và Homo Deus' },
  { name: 'Nguyễn Nhật Ánh', nationality: 'Việt Nam', birthYear: 1955, bio: 'Nhà văn nổi tiếng với nhiều tác phẩm văn học Việt Nam' },
  { name: 'Nam Cao', nationality: 'Việt Nam', birthYear: 1915, bio: 'Nhà văn hiện thực xuất sắc của văn học Việt Nam' },
  { name: 'N. Gregory Mankiw', nationality: 'Mỹ', birthYear: 1958, bio: 'Giáo sư kinh tế học tại Đại học Harvard' },
  { name: 'Gilbert Strang', nationality: 'Mỹ', birthYear: 1934, bio: 'Giáo sư Toán học tại MIT, tác giả giáo trình Đại số tuyến tính' },
  { name: 'Raymond Murphy', nationality: 'Anh', birthYear: 1946, bio: 'Tác giả bộ sách ngữ pháp tiếng Anh English Grammar in Use' },
  { name: 'Cal Newport', nationality: 'Mỹ', birthYear: 1982, bio: 'Giáo sư Khoa học máy tính và tác giả Deep Work' },
];

type BookSeed = {
  isbn: string;
  title: string;
  publisher: string;
  publishYear: number;
  language: string;
  pages: number;
  description: string;
  categories: number[];
  authors: number[];
  copiesCount: number;
};

const BOOKS: BookSeed[] = [
  { isbn: '9780132350884', title: 'Clean Code: A Handbook of Agile Software Craftsmanship', publisher: 'Prentice Hall', publishYear: 2008, language: 'Tiếng Anh', pages: 464, description: 'Hướng dẫn viết mã nguồn sạch, dễ đọc và dễ bảo trì.', categories: [0, 1], authors: [0], copiesCount: 4 },
  { isbn: '9780134494166', title: 'Clean Architecture', publisher: 'Prentice Hall', publishYear: 2017, language: 'Tiếng Anh', pages: 432, description: 'Nguyên lý thiết kế kiến trúc phần mềm bền vững.', categories: [0, 1], authors: [0], copiesCount: 4 },
  { isbn: '9781449373320', title: 'Designing Data-Intensive Applications', publisher: "O'Reilly Media", publishYear: 2017, language: 'Tiếng Anh', pages: 616, description: 'Hệ thống lưu trữ, sao chép, phân vùng và xử lý dữ liệu lớn.', categories: [0, 1], authors: [1], copiesCount: 5 },
  { isbn: '9780262046305', title: 'Introduction to Algorithms (4th Edition)', publisher: 'MIT Press', publishYear: 2022, language: 'Tiếng Anh', pages: 1312, description: 'Giáo trình thuật toán và cấu trúc dữ liệu kinh điển.', categories: [0, 2], authors: [2], copiesCount: 4 },
  { isbn: '9780134757599', title: 'Refactoring: Improving the Design of Existing Code', publisher: 'Addison-Wesley', publishYear: 2018, language: 'Tiếng Anh', pages: 448, description: 'Kỹ thuật tái cấu trúc mã nguồn an toàn và có hệ thống.', categories: [1], authors: [3], copiesCount: 3 },
  { isbn: '9780321125217', title: 'Domain-Driven Design', publisher: 'Addison-Wesley', publishYear: 2003, language: 'Tiếng Anh', pages: 560, description: 'Thiết kế phần mềm hướng miền nghiệp vụ phức tạp.', categories: [1], authors: [4], copiesCount: 3 },
  { isbn: '9780133591620', title: 'Modern Operating Systems', publisher: 'Pearson', publishYear: 2014, language: 'Tiếng Anh', pages: 1136, description: 'Kiến thức cốt lõi về tiến trình, bộ nhớ và hệ thống tệp.', categories: [0], authors: [5], copiesCount: 4 },
  { isbn: '9780132126953', title: 'Computer Networks', publisher: 'Pearson', publishYear: 2010, language: 'Tiếng Anh', pages: 960, description: 'Kiến trúc mạng máy tính từ tầng vật lý tới ứng dụng.', categories: [0], authors: [5], copiesCount: 3 },
  { isbn: '9780262035613', title: 'Deep Learning', publisher: 'MIT Press', publishYear: 2016, language: 'Tiếng Anh', pages: 800, description: 'Nền tảng toán học và kiến trúc mạng nơ-ron sâu.', categories: [0, 2], authors: [6], copiesCount: 4 },
  { isbn: '9780374533557', title: 'Thinking, Fast and Slow', publisher: 'Farrar, Straus and Giroux', publishYear: 2011, language: 'Tiếng Anh', pages: 499, description: 'Hai hệ thống tư duy của con người và thiên kiến nhận thức.', categories: [7, 3], authors: [7], copiesCount: 4 },
  { isbn: '9786041112001', title: 'Tư Duy Nhanh Và Chậm (Bản Tiếng Việt)', publisher: 'NXB Thế Giới', publishYear: 2019, language: 'Tiếng Việt', pages: 612, description: 'Bản dịch tiếng Việt đầy đủ của tác phẩm kinh điển về tâm lý hành vi.', categories: [7, 3], authors: [7], copiesCount: 4 },
  { isbn: '9780062316097', title: 'Sapiens: A Brief History of Humankind', publisher: 'Harper', publishYear: 2015, language: 'Tiếng Anh', pages: 464, description: 'Lược sử loài người từ thời đồ đá đến kỷ nguyên công nghệ.', categories: [5], authors: [8], copiesCount: 3 },
  { isbn: '9786043440123', title: 'Sapiens: Lược Sử Loài Người', publisher: 'NXB Tri Thức', publishYear: 2021, language: 'Tiếng Việt', pages: 560, description: 'Hành trình tiến hóa và hình thành văn minh nhân loại.', categories: [5, 7], authors: [8], copiesCount: 4 },
  { isbn: '9786043440456', title: 'Homo Deus: Lược Sử Tương Lai', publisher: 'NXB Thế Giới', publishYear: 2020, language: 'Tiếng Việt', pages: 520, description: 'Dự báo tương lai loài người trong kỷ nguyên dữ liệu và AI.', categories: [5, 0], authors: [8], copiesCount: 3 },
  { isbn: '9786041098015', title: 'Cho Tôi Xin Một Vé Đi Tuổi Thơ', publisher: 'NXB Trẻ', publishYear: 2018, language: 'Tiếng Việt', pages: 208, description: 'Tác phẩm văn học giàu cảm xúc về ký ức tuổi thơ.', categories: [4], authors: [9], copiesCount: 4 },
  { isbn: '9786041098022', title: 'Mắt Biếc', publisher: 'NXB Trẻ', publishYear: 2019, language: 'Tiếng Việt', pages: 300, description: 'Câu chuyện tình yêu trong trẻo và day dứt của Ngạn và Hà Lan.', categories: [4], authors: [9], copiesCount: 3 },
  { isbn: '9786041098039', title: 'Tôi Thấy Hoa Vàng Trên Cỏ Xanh', publisher: 'NXB Trẻ', publishYear: 2017, language: 'Tiếng Việt', pages: 378, description: 'Bức tranh làng quê Việt Nam qua góc nhìn trẻ thơ.', categories: [4], authors: [9], copiesCount: 3 },
  { isbn: '9786042001011', title: 'Chí Phèo và Các Truyện Ngắn Tuyển Chọn', publisher: 'NXB Văn Học', publishYear: 2016, language: 'Tiếng Việt', pages: 280, description: 'Tuyển tập truyện ngắn hiện thực xuất sắc của Nam Cao.', categories: [4, 5], authors: [10], copiesCount: 3 },
  { isbn: '9786042001028', title: 'Sống Mòn', publisher: 'NXB Văn Học', publishYear: 2018, language: 'Tiếng Việt', pages: 310, description: 'Tiểu thuyết tâm lý xã hội sâu sắc về thân phận trí thức nghèo.', categories: [4, 7], authors: [10], copiesCount: 3 },
  { isbn: '9780357038314', title: 'Principles of Economics', publisher: 'Cengage Learning', publishYear: 2020, language: 'Tiếng Anh', pages: 864, description: 'Giáo trình kinh tế học vi mô và vĩ mô nền tảng.', categories: [3], authors: [11], copiesCount: 4 },
  { isbn: '9786043002014', title: 'Nguyên Lý Kinh Tế Học (Tập 1)', publisher: 'NXB Đại học Kinh tế Quốc dân', publishYear: 2021, language: 'Tiếng Việt', pages: 540, description: 'Tài liệu giảng dạy kinh tế học cho sinh viên đại học.', categories: [3], authors: [11], copiesCount: 3 },
  { isbn: '9780980232776', title: 'Introduction to Linear Algebra (5th Edition)', publisher: 'Wellesley-Cambridge Press', publishYear: 2016, language: 'Tiếng Anh', pages: 584, description: 'Giáo trình Đại số tuyến tính nổi tiếng của MIT.', categories: [2], authors: [12], copiesCount: 4 },
  { isbn: '9780692196380', title: 'Linear Algebra and Learning from Data', publisher: 'Wellesley-Cambridge Press', publishYear: 2019, language: 'Tiếng Anh', pages: 432, description: 'Kết nối đại số tuyến tính với học máy và khoa học dữ liệu.', categories: [2, 0], authors: [12], copiesCount: 3 },
  { isbn: '9781108457651', title: 'English Grammar in Use (5th Edition)', publisher: 'Cambridge University Press', publishYear: 2019, language: 'Tiếng Anh', pages: 380, description: 'Sách tự học và tra cứu ngữ pháp tiếng Anh chuẩn quốc tế.', categories: [6], authors: [13], copiesCount: 4 },
  { isbn: '9781108457736', title: 'Essential Grammar in Use', publisher: 'Cambridge University Press', publishYear: 2018, language: 'Tiếng Anh', pages: 319, description: 'Ngữ pháp tiếng Anh căn bản kèm bài tập thực hành.', categories: [6], authors: [13], copiesCount: 3 },
  { isbn: '9781455586691', title: 'Deep Work: Rules for Focused Success in a Distracted World', publisher: 'Grand Central Publishing', publishYear: 2016, language: 'Tiếng Anh', pages: 304, description: 'Phương pháp làm việc sâu để đạt hiệu suất vượt trội.', categories: [7, 3], authors: [14], copiesCount: 3 },
  { isbn: '9786049003017', title: 'Làm Ra Làm, Chơi Ra Chơi (Deep Work)', publisher: 'NXB Thế Giới', publishYear: 2021, language: 'Tiếng Việt', pages: 336, description: 'Rèn luyện sự tập trung sâu trong kỷ nguyên xao nhãng.', categories: [7], authors: [14], copiesCount: 3 },
  { isbn: '9780137081073', title: 'The Clean Coder', publisher: 'Prentice Hall', publishYear: 2011, language: 'Tiếng Anh', pages: 256, description: 'Quy tắc ứng xử chuyên nghiệp cho lập trình viên.', categories: [1, 7], authors: [0], copiesCount: 3 },
  { isbn: '9780321127426', title: 'Patterns of Enterprise Application Architecture', publisher: 'Addison-Wesley', publishYear: 2002, language: 'Tiếng Anh', pages: 560, description: 'Các mẫu thiết kế kinh điển cho ứng dụng doanh nghiệp.', categories: [1, 0], authors: [3], copiesCount: 3 },
  { isbn: '9780135974445', title: 'Clean Agile: Back to Basics', publisher: 'Prentice Hall', publishYear: 2019, language: 'Tiếng Anh', pages: 240, description: 'Trở về giá trị cốt lõi của phát triển phần mềm Agile.', categories: [1, 3], authors: [0], copiesCount: 3 },
  { isbn: '9780262518802', title: 'Algorithms Unlocked', publisher: 'MIT Press', publishYear: 2013, language: 'Tiếng Anh', pages: 240, description: 'Giải thích thuật toán máy tính theo cách trực quan dễ hiểu.', categories: [0, 2], authors: [2], copiesCount: 3 },
  { isbn: '9786041145009', title: 'Giáo Trình Cơ Sở Dữ Liệu Quan Hệ & PostgreSQL', publisher: 'NXB Đại học Quốc gia', publishYear: 2023, language: 'Tiếng Việt', pages: 420, description: 'Chuẩn hóa 3NF, đánh chỉ mục, transaction và tối ưu truy vấn.', categories: [0, 1], authors: [1, 3], copiesCount: 4 },
  { isbn: '9786041145016', title: 'Nhập Môn Trí Tuệ Nhân Tạo & Học Sâu', publisher: 'NXB Khoa học và Kỹ thuật', publishYear: 2024, language: 'Tiếng Việt', pages: 490, description: 'Tổng quan AI hiện đại, học máy và ứng dụng thực tiễn.', categories: [0, 2], authors: [6, 12], copiesCount: 3 },
  { isbn: '9786041145023', title: 'Kỹ Năng Tiếng Anh Chuyên Ngành Công Nghệ Thông Tin', publisher: 'NXB Giáo Dục', publishYear: 2022, language: 'Song ngữ', pages: 310, description: 'Từ vựng, đọc hiểu tài liệu kỹ thuật và viết báo cáo IT.', categories: [6, 0], authors: [13, 14], copiesCount: 3 },
  { isbn: '9786041145030', title: 'Quản Trị Dự Án Phần Mềm Thực Chiến', publisher: 'NXB Thông tin và Truyền thông', publishYear: 2023, language: 'Tiếng Việt', pages: 365, description: 'Lập kế hoạch, ước lượng, quản trị rủi ro và vận hành đội ngũ.', categories: [1, 3, 7], authors: [3, 4], copiesCount: 3 },
];

const addDays = (base: Date, days: number): Date => new Date(base.getTime() + days * 24 * 60 * 60 * 1000);

async function main(): Promise<void> {
  console.log('🌱 Starting seed for 14-table Library Management Database...');

  const defaultPasswordHash = await bcrypt.hash('password123', 10);

  // 1. Seed 9 Standard Library Settings
  for (const setting of STANDARD_SETTINGS) {
    await prisma.librarySetting.upsert({
      where: { key: setting.key },
      update: {
        value: setting.value,
        valueType: setting.valueType,
        description: setting.description,
      },
      create: setting,
    });
  }

  // 2. Seed 22 Users across all 4 roles
  const userSeeds: Array<{
    email: string;
    fullName: string;
    role: Role;
    phone: string;
    studentOrStaffCode: string;
    address: string;
    status?: UserStatus;
  }> = [
    { email: 'manager@example.com', fullName: 'Nguyễn Minh Quân', role: Role.MANAGER, phone: '0901000001', studentOrStaffCode: 'MGR001', address: 'TP. Hồ Chí Minh' },
    { email: 'librarian@example.com', fullName: 'Trần Thị Thu Hà', role: Role.LIBRARIAN, phone: '0901000002', studentOrStaffCode: 'LIB001', address: 'TP. Hồ Chí Minh' },
    { email: 'librarian2@example.com', fullName: 'Lê Hoàng Nam', role: Role.LIBRARIAN, phone: '0901000003', studentOrStaffCode: 'LIB002', address: 'TP. Hồ Chí Minh' },
    { email: 'lecturer1@example.com', fullName: 'TS. Phạm Văn Hùng', role: Role.LECTURER, phone: '0902000001', studentOrStaffCode: 'GV001', address: 'Quận 1, TP.HCM' },
    { email: 'lecturer2@example.com', fullName: 'ThS. Đặng Ngọc Lan', role: Role.LECTURER, phone: '0902000002', studentOrStaffCode: 'GV002', address: 'Quận 3, TP.HCM' },
    { email: 'lecturer3@example.com', fullName: 'TS. Võ Thanh Tùng', role: Role.LECTURER, phone: '0902000003', studentOrStaffCode: 'GV003', address: 'Thủ Đức, TP.HCM' },
    { email: 'lecturer4@example.com', fullName: 'ThS. Bùi Thị Mai', role: Role.LECTURER, phone: '0902000004', studentOrStaffCode: 'GV004', address: 'Bình Thạnh, TP.HCM' },
  ];

  const studentNames = [
    'Nguyễn Văn Sỹ', 'Trần Tuấn Kiệt', 'Lê Minh Phát', 'Phạm Gia Bảo', 'Hoàng Thảo Vy',
    'Vũ Đức Anh', 'Đỗ Khánh Linh', 'Bùi Quốc Khánh', 'Ngô Phương Anh', 'Dương Hải Đăng',
    'Lý Minh Châu', 'Trịnh Công Sơn', 'Phan Nhật Minh', 'Hồ Ngọc Hân', 'Tạ Quang Huy',
  ];

  studentNames.forEach((fullName, idx) => {
    const num = String(idx + 1).padStart(2, '0');
    userSeeds.push({
      email: `student${idx + 1}@example.com`,
      fullName,
      role: Role.STUDENT,
      phone: `09030000${num}`,
      studentOrStaffCode: `SV2026${num}`,
      address: `KTX Khu ${(idx % 2) + 1}, Thủ Đức, TP.HCM`,
      status: idx === 14 ? UserStatus.LOCKED : UserStatus.ACTIVE,
    });
  });

  const usersByEmail = new Map<string, { id: string; email: string; role: Role }>();
  for (const u of userSeeds) {
    const status = u.status ?? UserStatus.ACTIVE;
    const record = await prisma.user.upsert({
      where: { email: u.email },
      update: { fullName: u.fullName, role: u.role, status, isActive: status === UserStatus.ACTIVE },
      create: {
        email: u.email,
        password: defaultPasswordHash,
        fullName: u.fullName,
        phone: u.phone,
        studentOrStaffCode: u.studentOrStaffCode,
        address: u.address,
        role: u.role,
        status,
        isActive: status === UserStatus.ACTIVE,
      },
    });
    usersByEmail.set(record.email, { id: record.id, email: record.email, role: record.role });
  }

  const manager = usersByEmail.get('manager@example.com')!;
  const librarians = [
    usersByEmail.get('librarian@example.com')!,
    usersByEmail.get('librarian2@example.com')!,
  ];
  const readers = userSeeds
    .filter((u) => (u.role === Role.STUDENT || u.role === Role.LECTURER) && (u.status ?? UserStatus.ACTIVE) === UserStatus.ACTIVE)
    .map((u) => usersByEmail.get(u.email)!);

  // 3. Seed 8 Categories
  const categoryRecords: Array<{ id: string }> = [];
  for (const c of CATEGORIES) {
    const rec = await prisma.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name, description: c.description },
      create: c,
    });
    categoryRecords.push({ id: rec.id });
  }

  // 4. Seed 15 Authors
  const authorRecords: Array<{ id: string }> = [];
  for (const a of AUTHORS) {
    const existing = await prisma.author.findFirst({ where: { name: a.name } });
    const rec = existing
      ? await prisma.author.update({ where: { id: existing.id }, data: a })
      : await prisma.author.create({ data: a });
    authorRecords.push({ id: rec.id });
  }

  // 5. Seed 35 Books + BookCategory (N-N) + BookAuthor (N-N) + 119 BookCopies
  const bookRecords: Array<{ id: string }> = [];
  const allCopies: Array<{ id: string; bookId: string; barcode: string }> = [];
  let barcodeSeq = 1;

  for (let bIdx = 0; bIdx < BOOKS.length; bIdx++) {
    const b = BOOKS[bIdx];
    const book = await prisma.book.upsert({
      where: { isbn: b.isbn },
      update: {
        title: b.title,
        publisher: b.publisher,
        publishYear: b.publishYear,
        language: b.language,
        pages: b.pages,
        description: b.description,
      },
      create: {
        isbn: b.isbn,
        title: b.title,
        publisher: b.publisher,
        publishYear: b.publishYear,
        language: b.language,
        pages: b.pages,
        description: b.description,
        bookCategories: {
          create: b.categories.map((ci) => ({ categoryId: categoryRecords[ci].id })),
        },
        bookAuthors: {
          create: b.authors.map((ai) => ({ authorId: authorRecords[ai].id })),
        },
      },
    });
    bookRecords.push({ id: book.id });

    const shelfPrefix = ['A', 'B', 'C', 'D', 'E', 'F'][bIdx % 6];
    for (let cIdx = 0; cIdx < b.copiesCount; cIdx++) {
      const barcode = `LIB-${String(barcodeSeq).padStart(4, '0')}`;
      barcodeSeq += 1;
      const copy = await prisma.bookCopy.upsert({
        where: { barcode },
        update: {},
        create: {
          bookId: book.id,
          barcode,
          shelfLocation: `${shelfPrefix}-${String((bIdx % 10) + 1).padStart(2, '0')}-${cIdx + 1}`,
          availabilityStatus: AvailabilityStatus.AVAILABLE,
          conditionStatus: ConditionStatus.GOOD,
          acquiredAt: addDays(new Date(), -(180 + bIdx * 5 + cIdx)),
        },
      });
      allCopies.push({ id: copy.id, bookId: copy.bookId, barcode: copy.barcode });
    }
  }

  // 6. Seed 100+ Historical & Active BorrowRecords / BorrowDetails / Fines / Reservations / AuditLogs
  const existingBorrowCount = await prisma.borrowDetail.count();
  if (existingBorrowCount < 100) {
    const now = new Date();
    let fineCount = 0;

    // 6a. 80 Returned historical borrow details (grouped into 45 borrow records)
    for (let i = 0; i < 45; i++) {
      const borrower = readers[i % readers.length];
      const librarian = librarians[i % librarians.length];
      const loanDays = borrower.role === Role.LECTURER ? 30 : 14;
      const borrowDate = addDays(now, -(150 - i * 3));
      const dueDate = addDays(borrowDate, loanDays);
      const isLate = i % 4 === 0;
      const lateDays = isLate ? (i % 5) + 2 : 0;
      const returnDate = isLate ? addDays(dueDate, lateDays) : addDays(borrowDate, Math.max(2, loanDays - 3));

      const copy1 = allCopies[(i * 2) % allCopies.length];
      const copy2 = i < 35 ? allCopies[(i * 2 + 1) % allCopies.length] : null;

      const record = await prisma.borrowRecord.create({
        data: {
          borrowerId: borrower.id,
          librarianId: librarian.id,
          borrowDate,
          notes: `Phiếu mượn lịch sử #${i + 1}`,
        },
      });

      const detail1 = await prisma.borrowDetail.create({
        data: {
          borrowRecordId: record.id,
          copyId: copy1.id,
          dueDate,
          returnDate,
          renewalCount: i % 5 === 0 ? 1 : 0,
          status: BorrowDetailStatus.RETURNED,
          returnCondition: ConditionStatus.GOOD,
        },
      });

      if (isLate) {
        const isPaid = i % 8 !== 0;
        await prisma.fine.create({
          data: {
            borrowDetailId: detail1.id,
            userId: borrower.id,
            amount: lateDays * 5000,
            reason: FineReason.OVERDUE,
            description: `Trễ hạn ${lateDays} ngày`,
            isPaid,
            paidAt: isPaid ? addDays(returnDate, 1) : null,
            collectedById: isPaid ? librarian.id : null,
          },
        });
        fineCount += 1;
      }

      if (copy2) {
        await prisma.borrowDetail.create({
          data: {
            borrowRecordId: record.id,
            copyId: copy2.id,
            dueDate,
            returnDate: addDays(borrowDate, Math.max(3, loanDays - 2)),
            renewalCount: 0,
            status: BorrowDetailStatus.RETURNED,
            returnCondition: ConditionStatus.GOOD,
          },
        });
      }
    }

    // 6b. 15 Currently Borrowed (6 due soon within 1-2 days for EmailJob demo)
    for (let i = 0; i < 15; i++) {
      const borrower = readers[i % readers.length];
      const librarian = librarians[i % librarians.length];
      const copy = allCopies[i];

      const dueSoon = i < 6;
      const borrowDate = dueSoon ? addDays(now, -13) : addDays(now, -4);
      const dueDate = dueSoon ? addDays(now, (i % 2) + 1) : addDays(now, 10);

      const record = await prisma.borrowRecord.create({
        data: {
          borrowerId: borrower.id,
          librarianId: librarian.id,
          borrowDate,
          notes: dueSoon ? 'Sắp đến hạn trả (demo nhắc nhở)' : 'Đang mượn bình thường',
        },
      });

      await prisma.borrowDetail.create({
        data: {
          borrowRecordId: record.id,
          copyId: copy.id,
          dueDate,
          status: BorrowDetailStatus.BORROWED,
        },
      });

      await prisma.bookCopy.update({
        where: { id: copy.id },
        data: { availabilityStatus: AvailabilityStatus.BORROWED },
      });
    }

    // 6c. 10 Currently Overdue (for v_overdue_details view & EmailJob OVERDUE demo)
    for (let i = 0; i < 10; i++) {
      const borrower = readers[(i + 5) % readers.length];
      const librarian = librarians[i % librarians.length];
      const copy = allCopies[15 + i];

      const overdueDays = i + 2;
      const borrowDate = addDays(now, -(14 + overdueDays));
      const dueDate = addDays(now, -overdueDays);

      const record = await prisma.borrowRecord.create({
        data: {
          borrowerId: borrower.id,
          librarianId: librarian.id,
          borrowDate,
          notes: `Phiếu quá hạn ${overdueDays} ngày`,
        },
      });

      await prisma.borrowDetail.create({
        data: {
          borrowRecordId: record.id,
          copyId: copy.id,
          dueDate,
          status: BorrowDetailStatus.OVERDUE,
        },
      });

      await prisma.bookCopy.update({
        where: { id: copy.id },
        data: { availabilityStatus: AvailabilityStatus.BORROWED },
      });
    }

    // Mark 2 copies damaged/lost and 1 copy soft-deleted for Soft Delete & filter testing
    if (allCopies.length > 110) {
      await prisma.bookCopy.update({
        where: { id: allCopies[105].id },
        data: { conditionStatus: ConditionStatus.DAMAGED, availabilityStatus: AvailabilityStatus.MAINTENANCE, notes: 'Rách bìa, đang đóng lại' },
      });
      await prisma.bookCopy.update({
        where: { id: allCopies[106].id },
        data: { conditionStatus: ConditionStatus.LOST, availabilityStatus: AvailabilityStatus.LOST, notes: 'Độc giả làm mất, đã đền bù' },
      });
      await prisma.bookCopy.update({
        where: { id: allCopies[107].id },
        data: { isDeleted: true, deletedAt: addDays(now, -5), notes: 'Thanh lý sách cũ (Soft Delete)' },
      });
    }

    // 6d. Seed 12 Reservations (PENDING, READY, FULFILLED, EXPIRED, CANCELLED)
    const readyCopy1 = allCopies[30];
    const readyCopy2 = allCopies[31];
    await prisma.bookCopy.updateMany({
      where: { id: { in: [readyCopy1.id, readyCopy2.id] } },
      data: { availabilityStatus: AvailabilityStatus.RESERVED },
    });

    await prisma.reservation.createMany({
      data: [
        { userId: readers[0].id, bookId: readyCopy1.bookId, copyId: readyCopy1.id, status: ReservationStatus.READY, reservedAt: addDays(now, -5), readyAt: addDays(now, -1), expiresAt: addDays(now, 2) },
        { userId: readers[1].id, bookId: readyCopy2.bookId, copyId: readyCopy2.id, status: ReservationStatus.READY, reservedAt: addDays(now, -6), readyAt: addDays(now, -4), expiresAt: addDays(now, -1) },
        { userId: readers[2].id, bookId: bookRecords[0].id, status: ReservationStatus.PENDING, reservedAt: addDays(now, -3) },
        { userId: readers[3].id, bookId: bookRecords[0].id, status: ReservationStatus.PENDING, reservedAt: addDays(now, -2) },
        { userId: readers[4].id, bookId: bookRecords[1].id, status: ReservationStatus.PENDING, reservedAt: addDays(now, -2) },
        { userId: readers[5].id, bookId: bookRecords[2].id, status: ReservationStatus.PENDING, reservedAt: addDays(now, -1) },
        { userId: readers[6].id, bookId: bookRecords[3].id, status: ReservationStatus.FULFILLED, reservedAt: addDays(now, -20), readyAt: addDays(now, -18), fulfilledAt: addDays(now, -17) },
        { userId: readers[7].id, bookId: bookRecords[4].id, status: ReservationStatus.FULFILLED, reservedAt: addDays(now, -25), readyAt: addDays(now, -23), fulfilledAt: addDays(now, -22) },
        { userId: readers[8].id, bookId: bookRecords[5].id, status: ReservationStatus.EXPIRED, reservedAt: addDays(now, -15), readyAt: addDays(now, -12), expiresAt: addDays(now, -9) },
        { userId: readers[9].id, bookId: bookRecords[6].id, status: ReservationStatus.CANCELLED, reservedAt: addDays(now, -10), cancelledAt: addDays(now, -9) },
        { userId: readers[10].id, bookId: bookRecords[7].id, status: ReservationStatus.PENDING, reservedAt: addDays(now, -1) },
        { userId: readers[11].id, bookId: bookRecords[8].id, status: ReservationStatus.CANCELLED, reservedAt: addDays(now, -8), cancelledAt: addDays(now, -7) },
      ],
    });

    // 6e. Seed 55 Audit Logs
    const auditActions = [
      { action: 'SEED_INIT', entityType: 'SYSTEM' },
      { action: 'CREATE_BOOK', entityType: 'BOOK' },
      { action: 'CREATE_COPY', entityType: 'BOOK_COPY' },
      { action: 'CREATE_BORROW', entityType: 'BORROW_RECORD' },
      { action: 'RETURN_BOOK', entityType: 'BORROW_DETAIL' },
      { action: 'UPDATE_SETTING', entityType: 'LIBRARY_SETTING' },
    ];

    const auditData = Array.from({ length: 55 }, (_, idx) => {
      const tpl = auditActions[idx % auditActions.length];
      const actor = idx % 3 === 0 ? manager : librarians[idx % librarians.length];
      return {
        userId: actor.id,
        action: tpl.action,
        entityType: tpl.entityType,
        entityId: bookRecords[idx % bookRecords.length].id,
        details: { note: `Seeded audit entry #${idx + 1}` },
        ipAddress: '127.0.0.1',
        createdAt: addDays(now, -(55 - idx)),
      };
    });
    await prisma.auditLog.createMany({ data: auditData });

    // 6f. Seed sample Notification Logs
    await prisma.notificationLog.createMany({
      data: [
        {
          userId: readers[0].id,
          type: NotificationType.RESERVATION_READY,
          refId: readyCopy1.id,
          periodKey: '2026-11-26',
          recipientEmail: readers[0].email,
          subject: '[Thư viện] Sách đặt trước đã sẵn sàng để nhận',
          status: NotificationStatus.SENT,
        },
        {
          userId: readers[5].id,
          type: NotificationType.OVERDUE,
          refId: allCopies[15].id,
          periodKey: '2026-11-26',
          recipientEmail: readers[5].email,
          subject: '[Thư viện] Thông báo sách mượn quá hạn trả',
          status: NotificationStatus.SENT,
        },
      ],
      skipDuplicates: true,
    });

    console.log(
      `✅ Seed completed: 9 settings, ${userSeeds.length} users, ${categoryRecords.length} categories, ${authorRecords.length} authors, ${bookRecords.length} books, ${allCopies.length} copies, ${80 + 15 + 10} borrow details, ${fineCount} fines, 12 reservations, 55 audit logs.`,
    );
  } else {
    console.log(`ℹ️ Borrow history already seeded (${existingBorrowCount} borrow details). Base entities synchronized.`);
  }
}

main()
  .catch((error) => {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
