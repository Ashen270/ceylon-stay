import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";


const prisma = new PrismaClient();


export const getLeases = async (req: Request, res: Response): Promise<void> => {
    try {
        const leases = await prisma.lease.findMany({
            include:{
                tenant: true,
                property: true
            }
        })
        res.json(leases);
    } catch (error: any) {
        res.status(500).json({ message: `error retriving Leases: ${error.message}`, error: error.message });
    }
}

export const getLeasePayments = async (req: Request, res: Response): Promise<void> => {
    try {
       const  {id} = req.params;
       const payments = await prisma.payment.findMany({
            where:  { leaseId: Number(id) },
        })
        res.json(payments);
    } catch (error: any) {
        res.status(500).json({ message: `error retriving Lease payments: ${error.message}`, error: error.message });
    }
}
