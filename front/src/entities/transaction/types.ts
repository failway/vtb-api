export interface Transaction {
  transactionId: string
  bookingDateTime: string
  transactionInformation: string
  amount: {
    amount: string
    currency: string
  }
  creditDebitIndicator: 'Credit' | 'Debit'
  status: string
}