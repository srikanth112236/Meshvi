import React, { createContext, useContext, useState, ReactNode } from 'react';
import { EnterpriseModal, EnterpriseModalVariant } from '../components/EnterpriseModal';

export interface ModalContextType {
  showSuccess: (title: string, message: string, confirmText?: string, onConfirm?: () => void) => void;
  showWarning: (title: string, message: string, confirmText?: string, onConfirm?: () => void) => void;
  showError: (title: string, message: string, confirmText?: string, onConfirm?: () => void) => void;
  showInfo: (title: string, message: string, confirmText?: string, onConfirm?: () => void) => void;
  showConfirm: (config: {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    isDestructive?: boolean;
    badgeText?: string;
    onConfirm: () => void;
    onCancel?: () => void;
  }) => void;
  hideModal: () => void;
}

interface ModalState {
  visible: boolean;
  variant: EnterpriseModalVariant;
  title: string;
  message: string;
  badgeText?: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel?: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [modalState, setModalState] = useState<ModalState>({
    visible: false,
    variant: 'info',
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const hideModal = () => {
    setModalState((prev) => ({ ...prev, visible: false }));
  };

  const showSuccess = (
    title: string,
    message: string,
    confirmText = 'Great',
    onConfirm?: () => void
  ) => {
    setModalState({
      visible: true,
      variant: 'success',
      title,
      message,
      confirmText,
      onConfirm: () => {
        hideModal();
        if (onConfirm) onConfirm();
      },
    });
  };

  const showWarning = (
    title: string,
    message: string,
    confirmText = 'Understood',
    onConfirm?: () => void
  ) => {
    setModalState({
      visible: true,
      variant: 'warning',
      title,
      message,
      confirmText,
      onConfirm: () => {
        hideModal();
        if (onConfirm) onConfirm();
      },
    });
  };

  const showError = (
    title: string,
    message: string,
    confirmText = 'Dismiss',
    onConfirm?: () => void
  ) => {
    setModalState({
      visible: true,
      variant: 'error',
      title,
      message,
      confirmText,
      onConfirm: () => {
        hideModal();
        if (onConfirm) onConfirm();
      },
    });
  };

  const showInfo = (
    title: string,
    message: string,
    confirmText = 'Acknowledge',
    onConfirm?: () => void
  ) => {
    setModalState({
      visible: true,
      variant: 'info',
      title,
      message,
      confirmText,
      onConfirm: () => {
        hideModal();
        if (onConfirm) onConfirm();
      },
    });
  };

  const showConfirm = ({
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    isDestructive = false,
    badgeText,
    onConfirm,
    onCancel,
  }: {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    isDestructive?: boolean;
    badgeText?: string;
    onConfirm: () => void;
    onCancel?: () => void;
  }) => {
    setModalState({
      visible: true,
      variant: 'confirm',
      title,
      message,
      badgeText,
      confirmText,
      cancelText,
      isDestructive,
      onConfirm: () => {
        hideModal();
        onConfirm();
      },
      onCancel: () => {
        hideModal();
        if (onCancel) onCancel();
      },
    });
  };

  return (
    <ModalContext.Provider
      value={{
        showSuccess,
        showWarning,
        showError,
        showInfo,
        showConfirm,
        hideModal,
      }}
    >
      {children}
      <EnterpriseModal
        visible={modalState.visible}
        variant={modalState.variant}
        title={modalState.title}
        message={modalState.message}
        badgeText={modalState.badgeText}
        confirmText={modalState.confirmText}
        cancelText={modalState.cancelText}
        isDestructive={modalState.isDestructive}
        onConfirm={modalState.onConfirm}
        onCancel={modalState.onCancel}
      />
    </ModalContext.Provider>
  );
};

export const useModal = (): ModalContextType => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};
