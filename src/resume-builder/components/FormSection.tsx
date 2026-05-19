import React from "react";

interface Props {
  title: string;
  children: React.ReactNode;
  icon?: string;
}

const FormSection: React.FC<Props> = ({ title, children, icon }) => {
  return (
    <div className="mb-6">
      <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2 border-b border-white/10 pb-2">
        {icon && <span>{icon}</span>}
        {title}
      </h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
};

export default FormSection;
