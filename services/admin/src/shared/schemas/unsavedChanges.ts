import { Dispatch, SetStateAction } from 'react';

export interface IUnsavedChangesModalContent {
  message?: string;
  dismissButtonLabel?: string;
  proceedLinkLabel?: string;
  proceedLinkHref?: string;
  saveLabel?: string;
  saveAction?: () => any;
}

export interface IUnsavedChangesContext {
  modalContent: IUnsavedChangesModalContent | undefined;
  setModalContent: Dispatch<
    SetStateAction<IUnsavedChangesModalContent | undefined>
  >;
  showModal: boolean;
  setShowModal: Dispatch<SetStateAction<boolean>>;
}
