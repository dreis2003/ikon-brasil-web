import { HttpContextToken } from '@angular/common/http';

export const PUBLIC_REQUEST = new HttpContextToken<boolean>(() => false);
