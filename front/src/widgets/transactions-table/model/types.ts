export interface MappedTransaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  currency: 'RUB' | 'USD' | 'EUR';
  type: 'debit' | 'credit';
  category: string;
}
