import AddMedicationForm from "@/components/AddMedicationForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Add Medication - MediRemind",
    description: "Add a new medication to your tracking list",
};

export default function AddPage() {
    return (
        <div className="py-6">
            <AddMedicationForm />
        </div>
    );
}
