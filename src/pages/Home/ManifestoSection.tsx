import React from 'react';
import { ManifestoModal } from './ManifestoModal';

export interface ManifestoSectionProps {
  onNavigateToCatalog?: () => void;
  onNavigateToSection?: (section: string) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export const ManifestoSection: React.FC<ManifestoSectionProps> = ({
  onNavigateToCatalog,
  onNavigateToSection,
  isOpen = false,
  onClose = () => {},
}) => {
  return (
    <ManifestoModal
      isOpen={isOpen}
      onClose={onClose}
      onNavigateToCatalog={onNavigateToCatalog}
      onNavigateToSection={onNavigateToSection}
    />
  );
};

export default ManifestoSection;
