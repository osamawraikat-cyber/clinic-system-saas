import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { HelpCircle } from "lucide-react"

export function InviteGuide() {
    return (
        <div className="border rounded-lg p-4 bg-muted/30">
            <div className="flex items-center gap-2 mb-2">
                <HelpCircle className="h-4 w-4 text-primary" />
                <h3 className="font-medium text-sm">How to manage your team</h3>
            </div>
            <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                    <AccordionTrigger className="text-sm py-2">How do I invite members?</AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground">
                        Click the "Invite Member" button, enter their email address and select their role. They will receive an email with a secure link to join your clinic.
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                    <AccordionTrigger className="text-sm py-2">What are the roles?</AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground">
                        <ul className="list-disc pl-4 space-y-1">
                            <li><strong>Admin/Owner:</strong> Full access to all settings and billing.</li>
                            <li><strong>Doctor:</strong> Can manage patients, appointments, and prescriptions.</li>
                            <li><strong>Nurse:</strong> Can manage visits and basic patient info.</li>
                            <li><strong>Receptionist:</strong> Can manage appointments and schedule.</li>
                        </ul>
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                    <AccordionTrigger className="text-sm py-2">Trouble accepting invites?</AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground">
                        If a user cannot accept an invite, ask them to check their spam folder. Using an Incognito window can also help ensure they are signing up or logging in with the correct account.
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>
    )
}
