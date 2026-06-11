export type ApiErrorAlert = {
  title: string;
  description: string;
};

export const API_ERROR_ALERTS: Record<string, ApiErrorAlert> = {
  ROOM_NOT_AVAILABLE: {
    title: "ຫ້ອງບໍ່ວ່າງ",
    description: "ຫ້ອງນີ້ມີການຈອງທັບຊ່ວງເວລາແລ້ວ ກະລຸນາເລືອກຫ້ອງ ຫຼື ປັບວັນເຂົ້າ–ອອກໃໝ່.",
  },
  INVALID_STATE: {
    title: "ບໍ່ສາມາດເຊັກເອົາໄດ້",
    description: "ແຂກຕ້ອງເຊັກອິນ (checked_in) ກ່ອນຈຶ່ງເຊັກເອົາໄດ້.",
  },
  INVALID_RESERVATION_STATE: {
    title: "ຍັງອອກໃບບິນບໍ່ໄດ້",
    description: "ຕ້ອງເຊັກອິນ ຫຼື ເຊັກເອົາແຂກກ່ອນ ຈຶ່ງອອກໃບບິນໄດ້.",
  },
  INVOICE_EXISTS: {
    title: "ມີໃບບິນແລ້ວ",
    description: "ການຈອງນີ້ມີໃບບິນແລ້ວ ເບິ່ງໃນລາຍການໃບບິນ.",
  },
};

export function getApiErrorAlert(code: string) {
  return API_ERROR_ALERTS[code];
}

export function isApiErrorCode(message: string) {
  return message in API_ERROR_ALERTS;
}
