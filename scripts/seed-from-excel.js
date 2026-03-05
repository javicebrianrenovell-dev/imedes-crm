"use strict";
// scripts/seed-from-excel.ts
// Ejecutar con: npx ts-node --project tsconfig.json scripts/seed-from-excel.ts
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
var supabase_js_1 = require("@supabase/supabase-js");
var path = __importStar(require("path"));
var xlsx = __importStar(require("xlsx"));
var SUPABASE_URL = (_a = process.env.NEXT_PUBLIC_SUPABASE_URL) !== null && _a !== void 0 ? _a : 'http://crm-imedes-supabase-841299-72-60-214-52.traefik.me';
var SERVICE_ROLE_KEY = (_b = process.env.SUPABASE_SERVICE_ROLE_KEY) !== null && _b !== void 0 ? _b : '';
var supabase = (0, supabase_js_1.createClient)(SUPABASE_URL, SERVICE_ROLE_KEY);
var RESPONSABLE_MAP = {
    'Javi': 'Javi',
    'Emèrit': 'Emèrit',
    'Kike': 'Kike',
    'Eva': 'Eva',
    'Andrea': 'Andrea',
};
var SITUACION_MAP = {
    'EN PREVISION': 'EN_PREVISION',
    'EN PREVISIÓN': 'EN_PREVISION',
    'PENDIENTE AGENDAR': 'PENDIENTE_AGENDAR',
    'PENDIENTE REUNION': 'PENDIENTE_REUNION',
    'PENDIENTE REUNIÓN': 'PENDIENTE_REUNION',
    'PENDIENTE PROPUESTA': 'PENDIENTE_PROPUESTA',
    'PENDIENTE LICITACION': 'PENDIENTE_LICITACION',
    'PENDIENTE LICITACIÓN': 'PENDIENTE_LICITACION',
    'PENDIENTE LICITACIÖN': 'PENDIENTE_LICITACION',
    'PROPUESTA PRESENTADA': 'PROPUESTA_PRESENTADA',
    'PROPUESTA EN EJECUCION': 'PROPUESTA_EN_EJECUCION',
    'PROPUESTA EN EJECUCIÓN': 'PROPUESTA_EN_EJECUCION',
    'PROPUESTA GANADA': 'PROPUESTA_GANADA',
    'PROPUESTA PERDIDA': 'PROPUESTA_PERDIDA',
    'DESCARTADA': 'DESCARTADA',
};
var SECTOR_MAP = {
    'PUBLICO': 'PÚBLICO',
    'PÚBLICO': 'PÚBLICO',
    'PRIVADO': 'PRIVADO',
};
function parseExcelDate(serial) {
    if (!serial || typeof serial !== 'number')
        return undefined;
    var date = new Date(Math.round((serial - 25569) * 86400 * 1000));
    return date.toISOString().split('T')[0];
}
function normalizeArea(area) {
    return __awaiter(this, void 0, void 0, function () {
        var map;
        var _a;
        return __generator(this, function (_b) {
            if (!area)
                return [2 /*return*/, 'CONSULTORÍA'];
            map = {
                'CONSULTORIA': 'CONSULTORÍA',
                'CONSULTORÍA': 'CONSULTORÍA',
                'COMUNICACION': 'COMUNICACIÓN',
                'COMUNICACIÓN': 'COMUNICACIÓN',
                'EA': 'EA',
            };
            return [2 /*return*/, (_a = map[area.toUpperCase()]) !== null && _a !== void 0 ? _a : 'CONSULTORÍA'];
        });
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var excelPath, rb, sheet, rows, responsablesDB, responsablesByName, clientesCreados, oportunidadesCreadas, errores, i, row, sectorRaw, clienteRaw, respoRaw, sector, existingCliente, clienteId, _a, newCliente, clienteError, responsableId, _i, _b, offset, nombre, areaRaw, presuRaw, presu, sitRaw, durRaw, dprRaw, sitNorm, areaNorm, opPayload, fUltima, fProxima, opError;
        var _c, _d, _e;
        return __generator(this, function (_f) {
            switch (_f.label) {
                case 0:
                    console.log('🌱 Iniciando seed interactivo desde Excel real...\n');
                    excelPath = path.resolve(process.cwd(), '../DESARROLLO NEGOCIO 2026 IMEDES.xlsx');
                    console.log("Leyendo fichero: ".concat(excelPath));
                    try {
                        rb = xlsx.readFile(excelPath);
                    }
                    catch (e) {
                        console.error('❌ No se encuentra el archivo Excel. Asegúrate de estar en imedes-crm y que el archivo está un nivel arriba.');
                        process.exit(1);
                    }
                    sheet = rb.Sheets[rb.SheetNames[0]];
                    rows = xlsx.utils.sheet_to_json(sheet, { header: 1 });
                    return [4 /*yield*/, supabase.from('responsables').select('*')];
                case 1:
                    responsablesDB = (_f.sent()).data;
                    responsablesByName = Object.fromEntries((responsablesDB !== null && responsablesDB !== void 0 ? responsablesDB : []).map(function (r) { return [r.nombre.toLowerCase(), r.id]; }));
                    clientesCreados = 0;
                    oportunidadesCreadas = 0;
                    errores = 0;
                    i = 2;
                    _f.label = 2;
                case 2:
                    if (!(i < rows.length)) return [3 /*break*/, 12];
                    row = rows[i];
                    if (!row || row.length === 0)
                        return [3 /*break*/, 11];
                    sectorRaw = String(row[0] || '').trim();
                    clienteRaw = String(row[1] || '').trim();
                    respoRaw = String(row[2] || '').trim();
                    if (!clienteRaw || clienteRaw === 'undefined')
                        return [3 /*break*/, 11]; // Fila vacía o inútil
                    sector = (_c = SECTOR_MAP[sectorRaw.toUpperCase()]) !== null && _c !== void 0 ? _c : 'PÚBLICO';
                    return [4 /*yield*/, supabase
                            .from('clientes')
                            .select('id')
                            .eq('nombre', clienteRaw)
                            .single()];
                case 3:
                    existingCliente = (_f.sent()).data;
                    clienteId = void 0;
                    if (!existingCliente) return [3 /*break*/, 4];
                    clienteId = existingCliente.id;
                    return [3 /*break*/, 6];
                case 4: return [4 /*yield*/, supabase
                        .from('clientes')
                        .insert({ nombre: clienteRaw, sector: sector, provincia: 'Valencia', comunidad: 'Comunitat Valenciana' })
                        .select('id')
                        .single()];
                case 5:
                    _a = _f.sent(), newCliente = _a.data, clienteError = _a.error;
                    if (clienteError || !newCliente) {
                        console.error("\u274C Error creando cliente \"".concat(clienteRaw, "\":"), clienteError === null || clienteError === void 0 ? void 0 : clienteError.message);
                        errores++;
                        return [3 /*break*/, 11];
                    }
                    clienteId = newCliente.id;
                    clientesCreados++;
                    console.log("\u2705 Cliente registrado: ".concat(clienteRaw));
                    _f.label = 6;
                case 6:
                    responsableId = responsablesByName[respoRaw.toLowerCase()];
                    _i = 0, _b = [3, 9, 15];
                    _f.label = 7;
                case 7:
                    if (!(_i < _b.length)) return [3 /*break*/, 11];
                    offset = _b[_i];
                    nombre = typeof row[offset] === 'string' ? row[offset].trim() : undefined;
                    if (!nombre)
                        return [3 /*break*/, 10];
                    areaRaw = typeof row[offset + 1] === 'string' ? row[offset + 1] : undefined;
                    presuRaw = row[offset + 2];
                    presu = typeof presuRaw === 'number' ? presuRaw : undefined;
                    sitRaw = typeof row[offset + 3] === 'string' ? row[offset + 3].trim() : undefined;
                    durRaw = row[offset + 4];
                    dprRaw = row[offset + 5];
                    sitNorm = (_e = SITUACION_MAP[(_d = sitRaw === null || sitRaw === void 0 ? void 0 : sitRaw.toUpperCase()) !== null && _d !== void 0 ? _d : '']) !== null && _e !== void 0 ? _e : 'EN_PREVISION';
                    return [4 /*yield*/, normalizeArea(areaRaw)];
                case 8:
                    areaNorm = _f.sent();
                    opPayload = {
                        cliente_id: clienteId,
                        responsable_id: responsableId !== null && responsableId !== void 0 ? responsableId : null,
                        nombre: nombre,
                        area: areaNorm,
                        situacion: sitNorm,
                        presupuesto: presu,
                    };
                    fUltima = parseExcelDate(durRaw);
                    if (fUltima)
                        opPayload.fecha_ultima_reunion = fUltima;
                    fProxima = parseExcelDate(dprRaw);
                    if (fProxima)
                        opPayload.fecha_proxima_reunion = fProxima;
                    return [4 /*yield*/, supabase.from('oportunidades').insert(opPayload)];
                case 9:
                    opError = (_f.sent()).error;
                    if (opError) {
                        console.error("  \u274C Error en op \"".concat(nombre, "\":"), opError.message);
                        errores++;
                    }
                    else {
                        oportunidadesCreadas++;
                        console.log("  \u2795 Proyecto: ".concat(nombre, " (").concat(sitNorm, ")"));
                    }
                    _f.label = 10;
                case 10:
                    _i++;
                    return [3 /*break*/, 7];
                case 11:
                    i++;
                    return [3 /*break*/, 2];
                case 12:
                    console.log("\n\uD83D\uDCCA Resumen de Importaci\u00F3n de Excel \uD83D\uDCCA");
                    console.log("Clientes creados/verificados: ".concat(clientesCreados, " (de ").concat(rows.length - 2, " procesados)"));
                    console.log("Oportunidades \u00FAnicas creadas: ".concat(oportunidadesCreadas));
                    console.log("Errores encontrados: ".concat(errores, "\n"));
                    return [2 /*return*/];
            }
        });
    });
}
main().catch(console.error);
