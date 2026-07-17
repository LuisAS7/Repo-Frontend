import { Badge } from "./Badge";
import { t } from "../../utils/translations";

type StatusBadgeProps = {
    status: string;
    className?: string;
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
    const label = t.status ? t.status(status) : status;

    const variant = (() => {
        switch (status) {
        case "SCHEDULED":
            return "default";
        case "WAITING":
            return "warning";
        case "READY":
        case "COMPLETED":
            return "success";
        case "CANCELLED":
            return "danger";
        default:
            return "neutral";
        }
    })();

    return <Badge variant={variant} className={className}>{label}</Badge>;
}