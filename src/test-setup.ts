import { vi } from 'vitest';
Object.defineProperty(window,'matchMedia',{value:vi.fn().mockImplementation(()=>({matches:false,addEventListener:vi.fn(),removeEventListener:vi.fn()}))});
document.body.innerHTML='<div id="root"></div>';
