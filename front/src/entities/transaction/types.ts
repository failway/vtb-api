export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  currency: 'RUB' | 'USD' | 'EUR';
  type: 'debit' | 'credit'; // списание или зачисление
  category: string;
}