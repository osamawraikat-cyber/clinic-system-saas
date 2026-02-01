'use client'

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { MoreHorizontal, Trash2 } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { format } from "date-fns"
// import { revokeInvitation } from "@/app/actions/invitations" // TODO: Implement revoke
import { toast } from "sonner"

interface Invitation {
    id: string
    email: string
    role: string
    status: string
    created_at: string
    expires_at: string
}

interface InvitationsListProps {
    invitations: Invitation[]
}

export function InvitationsList({ invitations }: InvitationsListProps) {
    if (invitations.length === 0) {
        return (
            <div className="text-center py-6 text-muted-foreground border rounded-lg bg-card">
                No pending invitations.
            </div>
        )
    }

    return (
        <div className="border rounded-lg bg-card">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Sent At</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {invitations.map((invite) => (
                        <TableRow key={invite.id}>
                            <TableCell>{invite.email}</TableCell>
                            <TableCell className="capitalize">{invite.role}</TableCell>
                            <TableCell>
                                <Badge variant={invite.status === 'pending' ? 'outline' : 'secondary'}>
                                    {invite.status}
                                </Badge>
                            </TableCell>
                            <TableCell>{format(new Date(invite.created_at), 'PPP')}</TableCell>
                            <TableCell>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                            <span className="sr-only">Open menu</span>
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem
                                            className="text-destructive focus:text-destructive"
                                            onClick={() => toast.info("Revoke not implemented yet")}
                                        >
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Revoke
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}
