export interface Transaction {
    transactionid: number;
    itemid: number;
    buyerid: number;
    sellerid: number;
    transactiondate: Date;
    finalprice: number;
    transactiontype: string;
    status: string;
}