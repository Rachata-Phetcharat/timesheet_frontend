# ⏱️ Timesheet & Leave Management System (Frontend)

ระบบบันทึกเวลาทำงานและการลาของพนักงาน พัฒนาด้วย **React 19 + TypeScript + Vite + Tailwind CSS + TanStack Query + React Hook Form + Zod** รองรับการทำงานทั้งแบบเชื่อมต่อ REST API จริงผ่าน Axios (JWT Interceptor) และแบบ Standalone/Offline Mock Fallback สำหรับการทดสอบทันที

---

## 📌 สารบัญ (Table of Contents)

1. [Tech Stack & เครื่องมือที่ใช้](#1-tech-stack--เครื่องมือที่ใช้)
2. [โครงสร้างโฟลเดอร์โปรเจกต์ (Project Structure)](#2-โครงสร้างโฟลเดอร์โปรเจกต์-project-structure)
3. [โมเดลข้อมูล (TypeScript Data Models)](#3-โมเดลข้อมูล-typescript-data-models)
4. [สเปก API & Endpoint Contracts](#4-สเปก-api--endpoint-contracts)
5. [ฟังก์ชันและหน้าจอหลัก (Pages & Features)](#5-ฟังก์ชันและหน้าจอหลัก-pages--features)
6. [ระบบจัดการ State, Auth & Query Caching](#6-ระบบจัดการ-state-auth--query-caching)
7. [การติดตั้งและเริ่มต้นใช้งาน (Getting Started)](#7-การติดตั้งและเริ่มต้นใช้งาน-getting-started)
8. [บัญชีผู้ใช้สำหรับทดสอบ (Demo Accounts)](#8-บัญชีผู้ใช้สำหรับทดสอบ-demo-accounts)

---

## 1. Tech Stack & เครื่องมือที่ใช้

| ส่วนประกอบ | เทคโนโลยี / ไลบรารี | รายละเอียดและประโยชน์ |
|---|---|---|
| **Core Framework** | React 19 + TypeScript | ประสิทธิภาพสูง พร้อม Type Safety ครบถ้วน |
| **Build Tool** | Vite 8 + `@tailwindcss/vite` | Bundle และ HMR รวดเร็วทันใจ รองรับ ESM |
| **Routing** | React Router v7 (`react-router-dom`) | จัดการเส้นทาง พร้อม Route Guard (Protected / Public / Admin) |
| **Data Fetching / State** | TanStack Query v5 (React Query) | จัดการ Caching, Auto Refetch, Stale Time และ Mutations |
| **Form & Validation** | React Hook Form + Zod | ฟอร์มประสิทธิภาพสูง ตรวจสอบ Validation ละเอียด |
| **Styling & UI** | Tailwind CSS v4 + Lucide Icons | Utility-first styling สไตล์ shadcn/ui สวยงามและ Responsive |
| **HTTP Client** | Axios | Instance เดี่ยว พร้อม Request/Response Interceptor จัดการ JWT & Auto Token Refresh |
| **Date & Time** | date-fns | จัดการการคำนวณและแปลงรูปแบบวันที่ |

---

## 2. โครงสร้างโฟลเดอร์โปรเจกต์ (Project Structure)

```
timesheet-frontend/
├── src/
│   ├── api/                           # ชั้นเชื่อมต่อ API และ Mock Data
│   │   ├── client.ts                  # Axios instance + JWT Bearer & Refresh Interceptor
│   │   ├── auth.ts                    # API เข้าสู่ระบบ, ต่ออายุโทเค็น, ข้อมูลผู้ใช้
│   │   ├── attendance.ts              # API ลงเวลาเข้า/ออก, สรุปประวัติ, รายงานทีม
│   │   ├── leaveRequests.ts           # API ยื่นคำขอลากิจ/ลาป่วย/ลาพักร้อน, อนุมัติใบลา
│   │   └── mockData.ts                # Mock Data เริ่มต้น (รองรับ LocalStorage persistence)
│   │
│   ├── components/
│   │   ├── ui/                        # Reusable Base Components สไตล์ shadcn/ui
│   │   │   ├── button.tsx             # ปุ่มพร้อม variant (default, destructive, outline, success, etc.)
│   │   │   ├── input.tsx              # Input field พร้อม label, error message, helper text
│   │   │   ├── card.tsx               # Card, CardHeader, CardTitle, CardContent, CardFooter
│   │   │   ├── badge.tsx              # Badge แสดงสถานะสีต่างๆ
│   │   │   ├── table.tsx              # Table, TableHeader, TableRow, TableCell
│   │   │   ├── select.tsx             # Dropdown Select component
│   │   │   └── modal.tsx              # Dialog / Modal พร้อม Backdrop & Escape key handler
│   │   │
│   │   ├── layout/                    # Layout หลักของระบบ
│   │   │   ├── Sidebar.tsx            # เมนูด้านข้าง + ป้ายแสดงสถานะระบบ + Drawer บนมือถือ
│   │   │   ├── Navbar.tsx             # แถบด้านบน + ข้อมูลผู้ใช้ + ปุ่มสลับ Role ด่วน + Logout
│   │   │   └── AppLayout.tsx          # Wrapper รวม Sidebar + Navbar + Outlet
│   │   │
│   │   ├── attendance/                # คอมโพเนนต์เฉพาะระบบลงเวลา
│   │   │   ├── ClockInOutCard.tsx     # การ์ดนาฬิกาดิจิทัลเรียลไทม์ + ปุ่ม Clock In/Out + Modal
│   │   │   ├── AttendanceTable.tsx    # ตารางประวัติลงเวลา + ตัวกรองสถานะ + เลือกเดือน
│   │   │   └── LateStatusBadge.tsx    # ป้ายแสดงสถานะ (ตรงเวลา / สาย xx นาที / ขาดงาน)
│   │   │
│   │   └── leave/                     # คอมโพเนนต์เฉพาะระบบการลา
│   │       ├── LeaveRequestForm.tsx   # ฟอร์มยื่นคำขอลา (React Hook Form + Zod)
│   │       ├── LeaveTypeSelect.tsx    # ตัวเลือกประเภทการลา (ลากิจ / ลาป่วย / ลาพักร้อน)
│   │       ├── LeaveRequestTable.tsx  # ตารางคำขอลา + Modal ดูรายละเอียด/พิจารณา
│   │       └── LeaveStatusBadge.tsx   # ป้ายสถานะคำขอ (รออนุมัติ / อนุมัติแล้ว / ไม่อนุมัติ)
│   │
│   ├── pages/                         # หน้าหลักของแอปพลิเคชัน
│   │   ├── LoginPage.tsx              # หน้าเข้าสู่ระบบ (JWT Login + 1-Click Demo Login)
│   │   ├── DashboardPage.tsx          # แดชบอร์ดสรุปสถิติประจำเดือน (KPI cards + Clock Card)
│   │   ├── AttendancePage.tsx         # หน้าบันทึกเวลาทำงาน + ประวัติ + Export CSV
│   │   ├── LeaveRequestPage.tsx       # หน้ายื่นคำขอลางาน + ตรวจสอบโควตาคงเหลือ
│   │   └── AdminReportPage.tsx        # หน้ารายงานทีมสำหรับ HR Admin + พิจารณาอนุมัติใบลา
│   │
│   ├── hooks/                         # Custom Hooks & React Query Wrappers
│   │   ├── useAuth.ts                 # Hook เข้าถึง Auth Context
│   │   ├── useAttendance.ts           # React Query สำหรับดึง/บันทึกเวลาเข้า-ออก
│   │   └── useLeaveRequests.ts        # React Query สำหรับจัดการคำขอลา
│   │
│   ├── types/                         # TypeScript Type Definitions
│   │   ├── attendance.ts              # AttendanceRecord, AttendanceSummary, AttendanceStatus
│   │   ├── leave.ts                   # LeaveRequest, LeaveType, LeaveStatus
│   │   └── user.ts                    # User, UserRole, AuthResponse, LoginCredentials
│   │
│   ├── routes/
│   │   └── router.tsx                 # Route Configuration & Guards (Protected/Public/Admin)
│   │
│   ├── context/
│   │   └── AuthContext.tsx            # Global Authentication Context & Session Management
│   │
│   ├── lib/
│   │   └── utils.ts                   # ฟังก์ชัน Helper (cn, formatDate, formatTime, formatDuration)
│   │
│   ├── index.css                      # Tailwind CSS Entrypoint
│   ├── App.tsx                        # Provider Setup (QueryClientProvider + AuthProvider)
│   └── main.tsx                       # React DOM Entrypoint
│
├── .env.example                       # ตัวอย่าง Environment Variables
├── .env                               # ค่า Environment ใช้งานจริง
├── tsconfig.json                      # การตั้งค่า TypeScript Compiler + Path Aliases (@/*)
├── vite.config.ts                     # การตั้งค่า Vite + Tailwind Plugin + Path Resolvers
└── package.json                       # รายการ Dependencies และ Scripts
```

---

## 3. โมเดลข้อมูล (TypeScript Data Models)

### 3.1 ข้อมูลการลงเวลา (`src/types/attendance.ts`)

```typescript
export type AttendanceStatus = 'on_time' | 'late' | 'absent';

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName?: string;
  date?: string;                  // รูปแบบ YYYY-MM-DD
  clockInAt: string | null;       // ISO 8601 Timestamp
  clockOutAt: string | null;      // ISO 8601 Timestamp
  status: AttendanceStatus;
  lateMinutes: number | null;     // จำนวนนาทีที่สาย
  notes?: string;
  workHours?: number | null;      // ชั่วโมงทำงานสุทธิ
}

export interface AttendanceSummary {
  totalDays: number;
  onTimeCount: number;
  lateCount: number;
  absentCount: number;
  leaveCount: number;
  totalWorkHours: number;
  currentStatus: 'not_clocked_in' | 'clocked_in' | 'clocked_out';
  todayRecord: AttendanceRecord | null;
}
```

### 3.2 ข้อมูลการลางาน (`src/types/leave.ts`)

```typescript
export type LeaveType = 'personal' | 'sick' | 'vacation'; // ลากิจ, ลาป่วย, ลาพักร้อน
export type LeaveStatus = 'pending' | 'approved' | 'rejected'; // รออนุมัติ, อนุมัติแล้ว, ไม่อนุมัติ

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName?: string;
  type: LeaveType;
  startDate: string;              // YYYY-MM-DD
  endDate: string;                // YYYY-MM-DD
  reason: string;
  status: LeaveStatus;
  createdAt?: string;
  approverName?: string;
  approverComment?: string;
}

export interface CreateLeaveRequestInput {
  type: LeaveType;
  startDate: string;
  endDate: string;
  reason: string;
}
```

### 3.3 ข้อมูลผู้ใช้งานและการยืนยันตัวตน (`src/types/user.ts`)

```typescript
export type UserRole = 'employee' | 'admin' | 'manager';

export interface User {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  position?: string;
  avatarUrl?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}
```

---

## 4. สเปก API & Endpoint Contracts

Frontend ถูกออกแบบมาให้เชื่อมต่อกับ Backend ตาม Contract ต่อไปนี้:

| Method | Endpoint | คำอธิบาย | ข้อมูลที่ส่ง (Payload) | ข้อมูลที่ตอบกลับ (Response) |
|---|---|---|---|---|
| `POST` | `/auth/login` | เข้าสู่ระบบด้วย Email/Password | `{ email, password }` | `{ accessToken, refreshToken, user }` |
| `POST` | `/auth/refresh` | ขอ Access Token ใหม่ | `{ refreshToken }` | `{ accessToken, refreshToken? }` |
| `GET` | `/auth/me` | ดึงโปรไฟล์ผู้ใช้ปัจจุบัน | - | `User` |
| `POST` | `/auth/logout` | ออกจากระบบ | - | `{ message: "Logged out" }` |
| `GET` | `/attendance/me` | ประวัติลงเวลาของฉัน | Query: `?month=2026-08` | `AttendanceRecord[]` |
| `GET` | `/attendance/summary` | สถิติสรุปภาพรวมรายเดือน | Query: `?month=2026-08` | `AttendanceSummary` |
| `POST` | `/attendance/clock-in` | ลงเวลาเข้างาน | `{ notes?: string }` | `AttendanceRecord` |
| `POST` | `/attendance/clock-out` | ลงเวลาออกงาน | `{ notes?: string }` | `AttendanceRecord` |
| `GET` | `/attendance/admin/reports`| รายงานเวลาทำงานทั้งทีม (Admin) | Query: `?month=&department=` | `AttendanceRecord[]` |
| `GET` | `/leave-requests/me` | รายการคำขอลาของตนเอง | - | `LeaveRequest[]` |
| `GET` | `/leave-requests` | รายการคำขอลาทั้งหมด (Admin) | - | `LeaveRequest[]` |
| `POST` | `/leave-requests` | ยื่นคำขอลางานใหม่ | `CreateLeaveRequestInput` | `LeaveRequest` |
| `GET` | `/leave-requests/:id` | ดูรายละเอียดคำขอลา | Parameter: `:id` | `LeaveRequest` |
| `PATCH`| `/leave-requests/:id/status` | อนุมัติ/ปฏิเสธคำขอลา (Admin) | `{ status, approverComment }`| `LeaveRequest` |

---

## 5. ฟังก์ชันและหน้าจอหลัก (Pages & Features)

### 5.1 หน้า Login (`/login`)
- ฟอร์มกรอกอีเมลและรหัสผ่าน พร้อมการตรวจสอบรูปแบบด้วย Zod
- มีปุ่ม **"1-Click Demo Login"** สลับเป็นพนักงาน (`Employee`) หรือ ผู้ดูแลระบบ (`HR Admin`) ได้ทันทีโดยไม่ต้องพิมพ์
- บันทึก `accessToken` และ `refreshToken` ลง `localStorage`

### 5.2 หน้า Dashboard (`/`)
- แสดงการ์ดต้อนรับพร้อมระบุแผนก, ตำแหน่ง และรหัสพนักงาน
- แสดง KPI Cards สรุปสถิติประจำเดือน:
  - อัตราการมาตรงเวลา (On-Time Rate %)
  - จำนวนครั้งและนาทีที่มาสายสะสม
  - จำนวนวันที่ขาดงาน / วันลา
  - ชั่วโมงการทำงานสะสมรวม
- รวมการ์ดลงเวลาด่วน (Clock-In Card)
- ตารางพรีวิวประวัติลงเวลาและรายการคำขอลาล่าสุด

### 5.3 หน้าบันทึกเวลาทำงาน (`/attendance`)
- **นาฬิกาดิจิทัลแบบ Live Ticking (GMT+7)** แสดงเวลาแบบเรียลไทม์
- ปุ่มกด **Clock In** และ **Clock Out** พร้อมระบบคำนวณการมาสายอัตโนมัติ (เกณฑ์ 09:00 น.)
- Modal สำหรับบันทึกหมายเหตุเพิ่มเติมก่อนกดยืนยัน
- ตัวกรองตามสถานะ (ตรงเวลา / มาสาย / ขาดงาน) และตัวเลือกดูย้อนหลังตามเดือน
- ปุ่ม **Export CSV** ส่งออกรายงานตารางเวลาที่รองรับฟอนต์ภาษาไทย (UTF-8 with BOM)

### 5.4 หน้ายื่นคำขอลางาน (`/leave-requests`)
- การ์ดสรุปโควตาสิทธิ์วันลาคงเหลือ (ลากิจ 6 วัน, ลาป่วย 30 วัน, ลาพักร้อน 10 วัน)
- ฟอร์มยื่นคำขอลา (Form validation ด้วย Zod):
  - คำนวณจำนวนวันลาให้อัตโนมัติ (Dynamic Day Counter)
  - ตรวจสอบว่าวันที่สิ้นสุดต้องไม่น้อยกว่าวันที่เริ่มต้น
  - บังคับระบุเหตุผลไม่ต่ำกว่า 5 ตัวอักษร
- ตารางแสดงประวัติและสถานะคำขอลา (รออนุมัติ / อนุมัติแล้ว / ไม่อนุมัติ) พร้อมปุ่มเปิดดูความเห็นจาก HR

### 5.5 หน้ารายงานทีมสำหรับแอดมิน (`/admin/reports`)
- สงวนสิทธิ์เฉพาะผู้ใช้ที่มี Role เป็น `admin` เท่านั้น (ผ่าน `AdminRoute` Guard)
- ระบบพิจารณาคำขอลางาน (Leave Approvals Queue) ให้แอดมินกด **Approve** หรือ **Reject** พร้อมแนบข้อความชี้แจง
- ตารางตรวจสอบเวลาทำงานของพนักงานทุกคนในองค์กร กรองตามเดือน, แผนก หรือค้นหาชื่อได้
- ปุ่มส่งออกรายงานเวลาทำงานทั้งทีมเป็นไฟล์ `.csv`

---

## 6. ระบบจัดการ State, Auth & Query Caching

### 6.1 JWT Interceptor & Refresh Token Flow
ใน [`src/api/client.ts`](file:///C:/Users/Rachata%20Phetcharat/time_sheet_frontend/src/api/client.ts):
1. **Request Interceptor**: อ่าน Token จาก `localStorage` แล้วแนบ `Authorization: Bearer <token>` ไปกับทุก Request อัตโนมัติ
2. **Response Interceptor**: ตรวจจับข้อผิดพลาด `401 Unauthorized`
   - พยายามเรียก `/auth/refresh` เพื่อขอ Access Token ใหม่
   - อัปเดต Token ใน Storage และทำ Retry Request เดิมที่เคยล้มเหลว
   - หาก Refresh Token หมดอายุ จะล้างสถานะใน Storage และส่งอีเวนต์ `auth:logout` นำผู้ใช้กลับไปหน้า Login

### 6.2 TanStack Query Cache Invalidation
- เมื่อผู้ใช้กด Clock In / Out หรือยื่นคำขอลา ระบบจะสั่ง `queryClient.invalidateQueries` ให้ดึงข้อมูลล่าสุดมาอัปเดตบนหน้าจอทันทีโดยไม่ต้อง Refresh หน้าเว็บ

---

## 7. การติดตั้งและเริ่มต้นใช้งาน (Getting Started)

### ขั้นตอนการรันโปรเจกต์:

1. ติดตั้ง Dependencies:
   ```bash
   npm install
   ```

2. ตั้งค่าไฟล์ Environment (กำหนด URL ของ Backend):
   ```bash
   cp .env.example .env
   ```
   *(ค่าเริ่มต้นคือ `VITE_API_BASE_URL=http://localhost:8000`)*

3. เริ่มต้นรัน Development Server:
   ```bash
   npm run dev
   ```
   เปิดเบราว์เซอร์ไปที่: `http://localhost:5173`

4. ทดสอบ Build สำหรับ Production:
   ```bash
   npm run build
   ```

---

## 8. บัญชีผู้ใช้สำหรับทดสอบ (Demo Accounts)

สามารถกดปุ่ม **Quick Demo** ในหน้าเข้าสู่ระบบเพื่อทดสอบได้ทันที:

| บทบาท (Role) | อีเมล (Email) | รหัสผ่าน (Password) | สิทธิ์การเข้าถึง |
|---|---|---|---|
| 👤 **พนักงาน (Employee)** | `somchai@company.com` | `password123` | Dashboard, บันทึกเวลา, ยื่นคำขอลา |
| 🛡️ **ผู้ดูแลระบบ (HR Admin)** | `admin@company.com` | `admin12345` | สิทธิ์ทุกหน้า + หน้ารายงานทีม & พิจารณาอนุมัติใบลา |

*(บนแถบ Navbar ด้านบนมีปุ่มสลับบทบาท `พนักงานทั่วไป` <-> `ผู้ดูแลระบบ (Admin)` ให้กดสลับเพื่อทดสอบ UI ได้ตลอดเวลา)*
