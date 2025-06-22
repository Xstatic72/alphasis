# Custom Form Components for AlphaSIS

This document explains how to use the new custom DatePicker and Form components that have been created to match the AlphaSIS UI/UX design system.

## Components Overview

### 1. DatePicker Component (`/components/ui/date-picker.tsx`)

A beautiful, responsive date picker with calendar dropdown that matches the app's design theme.

#### Features:
- ✅ Custom calendar dropdown with month navigation
- ✅ Responsive design (mobile-friendly)
- ✅ Form validation support
- ✅ Quick actions (Today, Clear)
- ✅ Beautiful animations with Framer Motion
- ✅ Consistent styling with AlphaSIS theme colors
- ✅ TypeScript support

#### Usage:
```tsx
import { DatePicker } from "@/components/ui/date-picker";
import { Calendar } from "lucide-react";

const [selectedDate, setSelectedDate] = useState("");

<DatePicker
  name="birthDate"
  label="Date of Birth"
  placeholder="Select date of birth"
  value={selectedDate}
  onChange={setSelectedDate}
  required={true}
  icon={Calendar}
  error={error}
/>
```

#### Props:
- `name?: string` - Input name for form submission
- `label?: string` - Field label
- `placeholder?: string` - Placeholder text
- `value?: string` - Current date value (YYYY-MM-DD format)
- `onChange?: (value: string) => void` - Change handler
- `required?: boolean` - Whether field is required
- `disabled?: boolean` - Whether field is disabled
- `className?: string` - Additional CSS classes
- `error?: string` - Error message to display
- `icon?: React.ComponentType` - Icon component to display

### 2. CustomForm Component (`/components/ui/custom-form.tsx`)

A comprehensive form component with validation, responsive layout, and beautiful animations.

#### Features:
- ✅ Multiple field types (text, email, date, select, textarea, etc.)
- ✅ Real-time validation with custom rules
- ✅ Responsive grid layout (1, 2, or 3 columns)
- ✅ Progress tracking
- ✅ Beautiful animations and transitions
- ✅ Form submission handling
- ✅ Error display and management
- ✅ Consistent styling with AlphaSIS theme

#### Usage:
```tsx
import { CustomForm, FormField } from "@/components/ui/custom-form";
import { User, Mail, Phone } from "lucide-react";

const formFields: FormField[] = [
  {
    name: "firstName",
    label: "First Name",
    type: "text",
    icon: User,
    placeholder: "Enter first name",
    required: true,
    validation: {
      minLength: 2,
      maxLength: 50,
      pattern: /^[a-zA-Z\s]+$/
    }
  },
  {
    name: "email",
    label: "Email Address",
    type: "email",
    icon: Mail,
    placeholder: "Enter email",
    required: true,
    validation: {
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    }
  },
  {
    name: "birthDate",
    label: "Date of Birth",
    type: "date",
    icon: Calendar,
    required: true
  }
];

const handleSubmit = async (data: Record<string, any>) => {
  // Handle form submission
  console.log("Form data:", data);
};

<CustomForm
  fields={formFields}
  onSubmit={handleSubmit}
  title="Student Registration"
  description="Fill in the student information"
  submitText="Register Student"
  cancelText="Cancel"
  onCancel={() => setOpen(false)}
  loading={loading}
  columns={2}
  spacing="md"
  showProgress={true}
/>
```

#### FormField Interface:
```tsx
interface FormField {
  name: string;                    // Field name
  label: string;                   // Field label
  type: FieldType;                 // Field type
  placeholder?: string;            // Placeholder text
  required?: boolean;              // Required field
  icon?: React.ComponentType;      // Icon component
  options?: { value: string; label: string }[]; // For select fields
  validation?: {                   // Validation rules
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    custom?: (value: any) => string | undefined;
  };
  className?: string;              // Additional CSS classes
  disabled?: boolean;              // Disabled state
  defaultValue?: any;              // Default value
  description?: string;            // Help text
}
```

#### Supported Field Types:
- `text` - Text input
- `email` - Email input with validation
- `password` - Password input
- `tel` - Telephone input
- `number` - Number input
- `date` - Date picker (uses custom DatePicker component)
- `select` - Dropdown select
- `textarea` - Multi-line text area
- `checkbox` - Checkbox input
- `radio` - Radio button (planned)

## Responsive Design

Both components are fully responsive and work beautifully on all screen sizes:

### Mobile (< 640px):
- Single column layout
- Full-width inputs
- Touch-friendly interactions
- Optimized calendar dropdown

### Tablet (641px - 768px):
- Flexible layout options
- Improved spacing
- Better touch targets

### Desktop (> 768px):
- Multi-column layouts (1, 2, or 3 columns)
- Hover effects
- Enhanced animations

## Integration Examples

### 1. Enhanced Add Student Dialog
See `/components/forms/enhanced-add-student-dialog.tsx` for a complete example of using the CustomForm component in a dialog.

### 2. Components Demo Page
Visit `/components-demo` to see both components in action with live examples.

### 3. Updated Students Page
The students page now includes both the original and enhanced add student forms for comparison.

## Styling and Theme

The components use the AlphaSIS design system with:
- **Primary Colors**: Orange gradient (`#ff4e00` to `#ec9f05`)
- **Secondary Colors**: Green gradient (`#8ea604` to `#f5bb00`)
- **Consistent Border Radius**: 0.75rem (12px)
- **Box Shadows**: Aerospace-inspired elevation
- **Animations**: Smooth Framer Motion transitions
- **Typography**: Consistent font weights and sizes

## Validation Features

### Built-in Validation Rules:
- `required` - Field must have a value
- `minLength` / `maxLength` - String length validation
- `min` / `max` - Number range validation
- `pattern` - RegExp pattern matching
- `custom` - Custom validation function

### Real-time Validation:
- Validates on blur (when user leaves field)
- Shows/hides errors dynamically
- Prevents form submission with errors
- Visual feedback with red borders and error messages

## Performance Considerations

- Components use React.memo for optimization
- Efficient re-rendering with proper dependency arrays
- Lazy validation (only validates touched fields)
- Debounced input handling where appropriate

## Accessibility

- Proper ARIA labels and descriptions
- Keyboard navigation support
- Screen reader compatible
- Focus management
- Color contrast compliance

## Future Enhancements

- [ ] Multi-step form support
- [ ] File upload field type
- [ ] Rich text editor field type
- [ ] Conditional field display
- [ ] Form auto-save functionality
- [ ] Internationalization support

## Usage in Existing Code

To use these components in existing forms, simply replace your current form implementation with the CustomForm component and define your fields using the FormField interface. The components are designed to be drop-in replacements that enhance the user experience while maintaining all existing functionality.
