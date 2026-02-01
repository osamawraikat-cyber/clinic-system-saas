'use client'

import { Document, Page, Text, View, StyleSheet, PDFDownloadLink } from '@react-pdf/renderer'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import { format } from 'date-fns'

// Create styles for PDF
const styles = StyleSheet.create({
    page: {
        padding: 40,
        fontSize: 11,
        fontFamily: 'Helvetica',
    },
    header: {
        marginBottom: 20,
        borderBottom: 2,
        paddingBottom: 10,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    subtitle: {
        fontSize: 10,
        color: '#666',
    },
    section: {
        marginTop: 15,
        marginBottom: 10,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#333',
    },
    row: {
        flexDirection: 'row',
        marginBottom: 5,
    },
    label: {
        width: '30%',
        fontWeight: 'bold',
    },
    value: {
        width: '70%',
    },
    table: {
        marginTop: 10,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#f5f5f5',
        padding: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    tableRow: {
        flexDirection: 'row',
        padding: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    tableColItem: {
        width: '70%',
    },
    tableColPrice: {
        width: '30%',
        textAlign: 'right',
    },
    totalRow: {
        flexDirection: 'row',
        padding: 8,
        backgroundColor: '#f9f9f9',
        fontWeight: 'bold',
    },
    footer: {
        marginTop: 30,
        paddingTop: 10,
        borderTop: 1,
        borderTopColor: '#ddd',
        textAlign: 'center',
        fontSize: 10,
        color: '#666',
    },
})

interface InvoicePDFProps {
    invoice: any
    patient: any
    procedures: any[]
}

// PDF Document Component
const InvoiceDocument = ({ invoice, patient, procedures }: InvoicePDFProps) => (
    <Document>
        <Page size="A4" style={styles.page}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>CLINIC RECEIPT</Text>
                <Text style={styles.subtitle}>Invoice #{invoice.invoice_number}</Text>
                <Text style={styles.subtitle}>Date: {format(new Date(invoice.created_at), 'MMMM dd, yyyy')}</Text>
            </View>

            {/* Patient Information */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Patient Information</Text>
                <View style={styles.row}>
                    <Text style={styles.label}>Name:</Text>
                    <Text style={styles.value}>{patient.full_name}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Phone:</Text>
                    <Text style={styles.value}>{patient.phone}</Text>
                </View>
                {patient.national_id && (
                    <View style={styles.row}>
                        <Text style={styles.label}>ID Number:</Text>
                        <Text style={styles.value}>{patient.national_id}</Text>
                    </View>
                )}
            </View>

            {/* Procedures/Services */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Services Rendered</Text>
                <View style={styles.table}>
                    <View style={styles.tableHeader}>
                        <Text style={styles.tableColItem}>Procedure</Text>
                        <Text style={styles.tableColPrice}>Cost</Text>
                    </View>
                    {procedures.map((vp: any, index: number) => (
                        <View key={index} style={styles.tableRow}>
                            <Text style={styles.tableColItem}>{vp.procedure?.name}</Text>
                            <Text style={styles.tableColPrice}>${Number(vp.cost).toFixed(2)}</Text>
                        </View>
                    ))}
                    <View style={styles.totalRow}>
                        <Text style={styles.tableColItem}>Total Amount</Text>
                        <Text style={styles.tableColPrice}>${Number(invoice.total_amount).toFixed(2)}</Text>
                    </View>
                </View>
            </View>

            {/* Payment Information */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Payment Details</Text>
                <View style={styles.row}>
                    <Text style={styles.label}>Total Amount:</Text>
                    <Text style={styles.value}>${Number(invoice.total_amount).toFixed(2)}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Amount Paid:</Text>
                    <Text style={styles.value}>${Number(invoice.amount_paid).toFixed(2)}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Balance Due:</Text>
                    <Text style={styles.value}>${(Number(invoice.total_amount) - Number(invoice.amount_paid)).toFixed(2)}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Status:</Text>
                    <Text style={styles.value}>{invoice.status.toUpperCase()}</Text>
                </View>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
                <Text>Thank you for choosing our clinic!</Text>
                <Text>For inquiries, please keep this receipt for your records.</Text>
            </View>
        </Page>
    </Document>
)

// Component that renders download button
export function InvoicePDF({ invoice, patient, procedures }: InvoicePDFProps) {
    return (
        <PDFDownloadLink
            document={<InvoiceDocument invoice={invoice} patient={patient} procedures={procedures} />}
            fileName={`invoice-${invoice.invoice_number}.pdf`}
        >
            {({ loading }) => (
                <Button variant="outline" disabled={loading}>
                    <Download className="h-4 w-4 mr-2" />
                    {loading ? 'Generating...' : 'Download PDF'}
                </Button>
            )}
        </PDFDownloadLink>
    )
}
