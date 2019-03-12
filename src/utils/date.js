import moment from "moment";

export function formatDateLong(stringDate) {
    const date = moment(stringDate);
    return date.format("YYYY-MM-DD HH:mm:ss");
}
