import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

export type Language = "en" | "ru" | "uz";

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};

interface LanguageProviderProps {
  children: ReactNode;
}

// Translation dictionaries
const translations = {
  en: {
    // Common
    "common.loading": "Loading...",
    "common.save": "Save",
    "common.cancel": "Cancel",
    "common.edit": "Edit",
    "common.delete": "Delete",
    "common.create": "Create",
    "common.update": "Update",
    "common.search": "Search",
    "common.refresh": "Refresh",
    "common.actions": "Actions",
    "common.confirm": "Confirm",
    "common.yes": "Yes",
    "common.no": "No",

    // Navigation
    "nav.dashboard": "Dashboard",
    "nav.users": "Users",
    "nav.employees": "Employees",
    "nav.departments": "Departments",
    "nav.jobs": "Jobs",
    "nav.languages": "Languages",
    "nav.profile": "Profile",
    "nav.logout": "Logout",

    // Auth
    "auth.login": "Login",
    "auth.logout": "Logout",
    "auth.email": "Email",
    "auth.password": "Password",
    "auth.name": "Name",
    "auth.phone": "Phone",
    "auth.role": "Role",
    "auth.loginSuccess": "Login successful",
    "auth.loginError": "Login failed",
    "auth.sessionExpired": "Session expired. Please login again.",

    // Users
    "users.title": "User Management",
    "users.create": "Create User",
    "users.edit": "Edit User",
    "users.delete": "Delete User",
    "users.deleteConfirm": "Are you sure you want to delete this user?",
    "users.name": "Name",
    "users.email": "Email",
    "users.phone": "Phone",
    "users.role": "Role",
    "users.createdAt": "Created At",
    "users.updatedAt": "Updated At",

    // Employees
    "employees.title": "Employee Management",
    "employees.create": "Create Employee",
    "employees.edit": "Edit Employee",
    "employees.delete": "Delete Employee",
    "employees.firstName": "First Name",
    "employees.lastName": "Last Name",
    "employees.email": "Email",
    "employees.phone": "Phone",
    "employees.hireDate": "Hire Date",
    "employees.salary": "Salary",
    "employees.department": "Department",
    "employees.job": "Job",

    // Departments
    "departments.title": "Department Management",
    "departments.create": "Create Department",
    "departments.edit": "Edit Department",
    "departments.delete": "Delete Department",
    "departments.name": "Department Name",
    "departments.description": "Description",
    "departments.manager": "Manager",
    "departments.location": "Location",

    // Jobs
    "jobs.title": "Job Management",
    "jobs.create": "Create Job",
    "jobs.edit": "Edit Job",
    "jobs.delete": "Delete Job",
    "jobs.jobTitle": "Job Title",
    "jobs.description": "Description",
    "jobs.minSalary": "Minimum Salary",
    "jobs.maxSalary": "Maximum Salary",

    // Theme
    "theme.light": "Light Theme",
    "theme.dark": "Dark Theme",
    "theme.toggle": "Toggle Theme",

    // Language
    "language.english": "English",
    "language.russian": "Русский",
    "language.uzbek": "O'zbekcha",
  },

  ru: {
    // Common
    "common.loading": "Загрузка...",
    "common.save": "Сохранить",
    "common.cancel": "Отмена",
    "common.edit": "Редактировать",
    "common.delete": "Удалить",
    "common.create": "Создать",
    "common.update": "Обновить",
    "common.search": "Поиск",
    "common.refresh": "Обновить",
    "common.actions": "Действия",
    "common.confirm": "Подтвердить",
    "common.yes": "Да",
    "common.no": "Нет",

    // Navigation
    "nav.dashboard": "Панель управления",
    "nav.users": "Пользователи",
    "nav.employees": "Сотрудники",
    "nav.departments": "Отделы",
    "nav.jobs": "Должности",
    "nav.profile": "Профиль",
    "nav.logout": "Выйти",

    // Auth
    "auth.login": "Войти",
    "auth.logout": "Выйти",
    "auth.email": "Email",
    "auth.password": "Пароль",
    "auth.name": "Имя",
    "auth.phone": "Телефон",
    "auth.role": "Роль",
    "auth.loginSuccess": "Вход выполнен успешно",
    "auth.loginError": "Ошибка входа",
    "auth.sessionExpired": "Сессия истекла. Пожалуйста, войдите снова.",

    // Users
    "users.title": "Управление пользователями",
    "users.create": "Создать пользователя",
    "users.edit": "Редактировать пользователя",
    "users.delete": "Удалить пользователя",
    "users.deleteConfirm": "Вы уверены, что хотите удалить этого пользователя?",
    "users.name": "Имя",
    "users.email": "Email",
    "users.phone": "Телефон",
    "users.role": "Роль",
    "users.createdAt": "Дата создания",
    "users.updatedAt": "Дата обновления",

    // Employees
    "employees.title": "Управление сотрудниками",
    "employees.create": "Создать сотрудника",
    "employees.edit": "Редактировать сотрудника",
    "employees.delete": "Удалить сотрудника",
    "employees.firstName": "Имя",
    "employees.lastName": "Фамилия",
    "employees.email": "Email",
    "employees.phone": "Телефон",
    "employees.hireDate": "Дата найма",
    "employees.salary": "Зарплата",
    "employees.department": "Отдел",
    "employees.job": "Должность",

    // Departments
    "departments.title": "Управление отделами",
    "departments.create": "Создать отдел",
    "departments.edit": "Редактировать отдел",
    "departments.delete": "Удалить отдел",
    "departments.name": "Название отдела",
    "departments.description": "Описание",
    "departments.manager": "Менеджер",
    "departments.location": "Местоположение",

    // Jobs
    "jobs.title": "Управление должностями",
    "jobs.create": "Создать должность",
    "jobs.edit": "Редактировать должность",
    "jobs.delete": "Удалить должность",
    "jobs.jobTitle": "Название должности",
    "jobs.description": "Описание",
    "jobs.minSalary": "Минимальная зарплата",
    "jobs.maxSalary": "Максимальная зарплата",

    // Theme
    "theme.light": "Светлая тема",
    "theme.dark": "Темная тема",
    "theme.toggle": "Переключить тему",

    // Language
    "language.english": "English",
    "language.russian": "Русский",
    "language.uzbek": "O'zbekcha",
  },

  uz: {
    // Common
    "common.loading": "Yuklanmoqda...",
    "common.save": "Saqlash",
    "common.cancel": "Bekor qilish",
    "common.edit": "Tahrirlash",
    "common.delete": "O'chirish",
    "common.create": "Yaratish",
    "common.update": "Yangilash",
    "common.search": "Qidirish",
    "common.refresh": "Yangilash",
    "common.actions": "Amallar",
    "common.confirm": "Tasdiqlash",
    "common.yes": "Ha",
    "common.no": "Yo'q",

    // Navigation
    "nav.dashboard": "Boshqaruv paneli",
    "nav.users": "Foydalanuvchilar",
    "nav.employees": "Xodimlar",
    "nav.departments": "Bo'limlar",
    "nav.jobs": "Lavozimlar",
    "nav.profile": "Profil",
    "nav.logout": "Chiqish",

    // Auth
    "auth.login": "Kirish",
    "auth.logout": "Chiqish",
    "auth.email": "Email",
    "auth.password": "Parol",
    "auth.name": "Ism",
    "auth.phone": "Telefon",
    "auth.role": "Rol",
    "auth.loginSuccess": "Muvaffaqiyatli kirildi",
    "auth.loginError": "Kirishda xatolik",
    "auth.sessionExpired": "Sessiya muddati tugadi. Iltimos, qaytadan kiring.",

    // Users
    "users.title": "Foydalanuvchilarni boshqarish",
    "users.create": "Foydalanuvchi yaratish",
    "users.edit": "Foydalanuvchini tahrirlash",
    "users.delete": "Foydalanuvchini o'chirish",
    "users.deleteConfirm": "Bu foydalanuvchini o'chirishni xohlaysizmi?",
    "users.name": "Ism",
    "users.email": "Email",
    "users.phone": "Telefon",
    "users.role": "Rol",
    "users.createdAt": "Yaratilgan sana",
    "users.updatedAt": "Yangilangan sana",

    // Employees
    "employees.title": "Xodimlarni boshqarish",
    "employees.create": "Xodim yaratish",
    "employees.edit": "Xodimni tahrirlash",
    "employees.delete": "Xodimni o'chirish",
    "employees.firstName": "Ism",
    "employees.lastName": "Familiya",
    "employees.email": "Email",
    "employees.phone": "Telefon",
    "employees.hireDate": "Ishga qabul qilingan sana",
    "employees.salary": "Maosh",
    "employees.department": "Bo'lim",
    "employees.job": "Lavozim",

    // Departments
    "departments.title": "Bo'limlarni boshqarish",
    "departments.create": "Bo'lim yaratish",
    "departments.edit": "Bo'limni tahrirlash",
    "departments.delete": "Bo'limni o'chirish",
    "departments.name": "Bo'lim nomi",
    "departments.description": "Tavsif",
    "departments.manager": "Menejer",
    "departments.location": "Manzil",

    // Jobs
    "jobs.title": "Lavozimlarni boshqarish",
    "jobs.create": "Lavozim yaratish",
    "jobs.edit": "Lavozimni tahrirlash",
    "jobs.delete": "Lavozimni o'chirish",
    "jobs.jobTitle": "Lavozim nomi",
    "jobs.description": "Tavsif",
    "jobs.minSalary": "Minimal maosh",
    "jobs.maxSalary": "Maksimal maosh",

    // Theme
    "theme.light": "Yorug' mavzu",
    "theme.dark": "Qorong'i mavzu",
    "theme.toggle": "Mavzuni o'zgartirish",

    // Language
    "language.english": "English",
    "language.russian": "Русский",
    "language.uzbek": "O'zbekcha",
  },
};

export const LanguageProvider: React.FC<LanguageProviderProps> = ({
  children,
}) => {
  const [language, setLanguageState] = useState<Language>(() => {
    // Get language from localStorage or default to 'en'
    const savedLanguage = localStorage.getItem("language") as Language;
    return savedLanguage || "en";
  });

  useEffect(() => {
    // Save language to localStorage whenever it changes
    localStorage.setItem("language", language);

    // Set document language attribute
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  const value: LanguageContextType = {
    language,
    setLanguage,
    t,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};
