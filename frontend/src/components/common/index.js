// Componentes básicos
export { default as Button } from './Button';
export { default as Input, TextArea } from './Input';
export { default as Checkbox } from './Checkbox';
export { default as Modal, ConfirmModal, useModal } from './Modal';

// Componentes de layout
export { 
  default as Layout, 
  PageLayout, 
  Section, 
  Grid, 
  Card, 
  Container,
  Divider 
} from './Layout';

// Re-exportar componentes útiles con alias
export { Input as TextField } from './Input';
export { TextArea as TextAreaField } from './Input';
export { Button as ActionButton } from './Button';
export { Modal as Dialog } from './Modal';
export { ConfirmModal as ConfirmDialog } from './Modal';
export { Card as Panel } from './Layout';
export { Section as CardSection } from './Layout';