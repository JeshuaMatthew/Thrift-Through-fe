import type { Transaction } from "../Types/Transaction";

export class TransactionServices {
    // Simulasi Database Transaksi
    private get transactions(): Transaction[] {
        // Cache bust to load new default data for v2
        const isV2 = localStorage.getItem('transactionDB_v2');
        if (!isV2) {
            localStorage.removeItem('transactionDB');
            localStorage.setItem('transactionDB_v2', 'true');
        }

        const data = localStorage.getItem('transactionDB');
        if (data) {
            // Rehydrate date objects since JSON.parse leaves them as strings
            const parsed = JSON.parse(data);
            return parsed.map((t: any) => ({
                ...t,
                transactiondate: new Date(t.transactiondate)
            }));
        }
        
        // Data default (mock)
        const defaultData: Transaction[] = [
            {
                transactionid: 1,
                itemid: 1001, // Updated dummy itemId to match ThriftService
                buyerid: 102,
                sellerid: 101,
                transactiondate: new Date('2023-11-15T10:30:00Z'),
                finalprice: 150000,
                transactiontype: 'buy',
                status: 'completed'
            },
            {
                transactionid: 2,
                itemid: 1002, // This matches the 'Terjual' item in ThriftService
                buyerid: 103,
                sellerid: 101, // Jeshua (User 101)
                transactiondate: new Date('2023-11-18T14:45:00Z'),
                finalprice: 150000,
                transactiontype: 'sell',
                status: 'completed'
            }
        ];
        
        localStorage.setItem('transactionDB', JSON.stringify(defaultData));
        return defaultData;
    }

    private set transactions(data: Transaction[]) {
        localStorage.setItem('transactionDB', JSON.stringify(data));
    }

    // ==========================================
    // 1. GET ALL TRANSACTIONS
    // ==========================================
    async getAllTransactions(): Promise<Transaction[]> {
        return this.transactions;
    }

    // ==========================================
    // 2. GET TRANSACTIONS BY ITEM ID
    // ==========================================
    async getTransactionsByItemId(itemId: number): Promise<Transaction[]> {
        return this.transactions.filter(t => t.itemid === itemId);
    }

    // ==========================================
    // 3. GET TRANSACTIONS AS SELLER
    // ==========================================
    async getTransactionsAsSeller(sellerId: number): Promise<Transaction[]> {
        return this.transactions.filter(t => t.sellerid === sellerId);
    }

    // ==========================================
    // 4. GET TRANSACTIONS AS BUYER
    // ==========================================
    async getTransactionsAsBuyer(buyerId: number): Promise<Transaction[]> {
        return this.transactions.filter(t => t.buyerid === buyerId);
    }
}
