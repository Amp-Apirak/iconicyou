// main.js
import { showToast } from './toast.js';
import { initModal } from './modal.js';
import { initFormHandlers } from './form-handler.js';

document.addEventListener('DOMContentLoaded', function() {
  initModal();
  initFormHandlers();
});