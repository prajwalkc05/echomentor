# Resume Builder Module

A modern, professional, and highly interactive Resume Builder built with React, TypeScript, and Tailwind CSS.

## 📁 Project Structure

```
resume-builder/
├── components/
│   ├── ResumeForm.tsx       # Main form with all sections
│   └── FormSection.tsx      # Reusable section wrapper
├── templates/
│   ├── Template1.tsx        # Modern Professional
│   ├── Template2.tsx        # Elegant Two-Column
│   ├── Template3.tsx        # Minimal Clean
│   └── Template4.tsx        # Creative Bold
├── data/
│   └── defaultData.ts       # Default and sample data
├── types/
│   └── resume.ts            # TypeScript interfaces
├── utils/
│   └── helpers.ts           # Utility functions
├── App.tsx                  # Main application component
├── index.ts                 # Export barrel
└── README.md                # This file
```

## 🎨 Features

### ✅ Complete Resume Builder
- **Personal Details**: Name, email, phone, location, title, summary, LinkedIn, website
- **Education**: Multiple entries with institution, degree, field, dates, GPA, description
- **Experience**: Work history with company, role, location, dates, current position toggle
- **Skills**: Tag-based skill management
- **Projects**: Project showcase with technologies and links
- **Certifications**: Professional certifications with credentials

### ✅ 4 Professional Templates
1. **Modern Pro** - Professional with purple accents and clean layout
2. **Elegant** - Two-column sidebar design with dark sidebar
3. **Minimal** - Clean and simple centered layout
4. **Creative** - Bold design with gradient header

### ✅ Advanced Features
- **Live Preview**: Real-time resume preview as you type
- **Auto-save**: Automatic saving to localStorage
- **Progress Tracking**: Visual progress indicator with checklist
- **Template Switching**: Switch templates without losing data
- **Sample Data**: Load sample data to see examples
- **PDF Export**: Download resume as PDF (print dialog)
- **Form Validation**: Built-in validation for required fields
- **Responsive Design**: Works on mobile, tablet, and desktop

## 🚀 Usage

### Basic Integration

```tsx
import ResumeBuilderApp from './resume-builder/App';

function App() {
  return <ResumeBuilderApp />;
}
```

### Using Individual Components

```tsx
import { ResumeForm, Template1, defaultData } from './resume-builder';
import { useState } from 'react';

function CustomResumeBuilder() {
  const [data, setData] = useState(defaultData);

  return (
    <div className="grid grid-cols-2 gap-4">
      <ResumeForm data={data} onChange={setData} />
      <Template1 data={data} />
    </div>
  );
}
```

## 📝 Data Structure

```typescript
interface ResumeData {
  personal: PersonalDetails;
  education: Education[];
  experience: Experience[];
  skills: string[];
  projects: Project[];
  certifications: Certification[];
}
```

## 🎯 Key Components

### ResumeForm
Main form component with tabbed navigation for all resume sections.

**Props:**
- `data: ResumeData` - Current resume data
- `onChange: (data: ResumeData) => void` - Callback when data changes

### FormSection
Reusable section wrapper with icon and description.

**Props:**
- `title: string` - Section title
- `icon?: ReactNode` - Optional icon
- `description?: string` - Optional description
- `children: ReactNode` - Form content

### Templates (1-4)
Resume template components for rendering the final resume.

**Props:**
- `data: ResumeData` - Resume data to display

## 🛠️ Utility Functions

### `generateId()`
Generates unique IDs for array items.

### `saveToLocalStorage(data)`
Saves resume data to localStorage.

### `loadFromLocalStorage()`
Loads resume data from localStorage.

### `calculateCompleteness(data)`
Calculates resume completion percentage (0-100).

### `exportToPDF(elementId, filename)`
Exports resume to PDF (currently triggers print dialog).

### `validateEmail(email)`
Validates email format.

### `validatePhone(phone)`
Validates phone number format.

## 🎨 Design System

The Resume Builder follows the EchoMentor design system:

- **Colors**: Purple primary (#7c3aed), dark backgrounds (#0f0f1e, #1a1a2e)
- **Typography**: Clean, modern fonts with proper hierarchy
- **Spacing**: Consistent padding and margins
- **Borders**: Subtle borders with white/5 opacity
- **Animations**: Smooth transitions on all interactive elements

## 📱 Responsive Design

- **Mobile**: Single column layout, stacked sections
- **Tablet**: Optimized two-column layout
- **Desktop**: Full three-column layout with preview

## 🔒 Data Persistence

- Auto-saves to localStorage every 1 second
- Data persists across page refreshes
- Manual reset option available
- Sample data can be loaded for testing

## 🎓 Best Practices

The code follows these best practices:

1. **TypeScript**: Strict typing for all components and data
2. **Modular**: Each component is self-contained and reusable
3. **Clean Code**: Well-organized, commented, and readable
4. **Performance**: Optimized re-renders with proper state management
5. **Accessibility**: Proper labels, keyboard support, and contrast
6. **Scalability**: Easy to add new templates or sections

## 🚀 Future Enhancements

Potential improvements:

- [ ] Real PDF export with jsPDF or html2pdf
- [ ] Backend integration for cloud storage
- [ ] More template options
- [ ] AI-powered content suggestions
- [ ] Resume scoring and tips
- [ ] Export to Word/Google Docs
- [ ] Multiple resume management
- [ ] Collaborative editing

## 📄 License

This module is part of the EchoMentor project.

## 👨‍💻 Development

### Adding a New Template

1. Create `Template5.tsx` in `templates/`
2. Follow the existing template structure
3. Accept `data: ResumeData` as prop
4. Add to templates array in `App.tsx`

### Adding a New Section

1. Update `resume.ts` types
2. Update `defaultData.ts`
3. Add form fields in `ResumeForm.tsx`
4. Update all templates to display the new section

## 🐛 Known Issues

- PDF export currently uses print dialog (needs proper PDF library)
- No backend integration yet (data only in localStorage)
- Preview scaling may need adjustment on very small screens

## 📞 Support

For issues or questions, please refer to the main EchoMentor documentation.

---

**Built with ❤️ for EchoMentor**
