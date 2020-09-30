"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.execAsync = void 0;
const shelljs_1 = __importDefault(require("shelljs"));
function execAsync(command, silent, ...params) {
    const allParams = typeof silent === 'string' ? [silent, ...params] : params;
    const fullCommand = `${command} ${allParams.filter(p => !!p).join(' ')}`;
    const silentBoolean = typeof silent === 'boolean' ? silent : true;
    return new Promise((resolve, reject) => {
        try {
            shelljs_1.default.exec(fullCommand, { silent: silentBoolean }, (code, stdout, stderr) => resolve(!silentBoolean ? code : { code, stdout, stderr }));
        }
        catch (err) {
            reject(err);
        }
    });
}
exports.execAsync = execAsync;
