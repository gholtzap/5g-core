import { ObjectId } from 'mongodb';

export interface SubscriberProfile {
  _id?: ObjectId;
  supi: string;
  permanentKey: string;
  operatorKey: string;
  sequenceNumber: string;
  plmn?: {
    mcc: string;
    mnc: string;
  };
  authenticationMethod?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateSubscriberRequest {
  supi: string;
  permanentKey: string;
  operatorKey: string;
  sequenceNumber: string;
  plmn?: {
    mcc: string;
    mnc: string;
  };
  authenticationMethod?: string;
}

export interface UpdateSubscriberRequest {
  permanentKey?: string;
  operatorKey?: string;
  sequenceNumber?: string;
  plmn?: {
    mcc: string;
    mnc: string;
  };
  authenticationMethod?: string;
}
