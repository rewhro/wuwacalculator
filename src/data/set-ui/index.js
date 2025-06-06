// /data/echo-set-ui/index.js
import five17 from './17.jsx';
import five2 from "./2.jsx";
import five4 from "./4.jsx";
import five5 from "./5.jsx";
import five7 from "./7.jsx";
import five11 from "./11.jsx";
import five16 from "./16.jsx";
import five18 from "./18.jsx";
import five13 from "./13.jsx";
import five10 from "./10.jsx";
import five9 from "./9.jsx";
import five6 from "./6.jsx";
import five3 from "./3.jsx";

export function getEchoSetUIOverrides(setId) {
    switch (setId) {
        case 17:
            return {
                fivePiece: five17,
            };
        case 2:
            return {
                fivePiece: five2,
            };
        case 4:
            return {
                fivePiece: five4
            };
        case 7:
            return {
                fivePiece: five7
            };
        case 5:
            return {
                fivePiece: five5
            };
        case 11:
            return {
                fivePiece: five11
            };
        case 10:
            return {
                fivePiece: five10
            };
        case 16:
            return {
                fivePiece: five16
            };
        case 18:
            return {
                fivePiece: five18
            };
        case 13:
            return {
                fivePiece: five13
            };
        case 9:
            return {
                fivePiece: five9
            };
        case 6:
            return {
                fivePiece: five6
            };
        case 3:
            return {
                fivePiece: five3
            }
        default:
            return {};
    }
}