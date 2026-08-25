export interface RegionalStation {
  id: string;
  name: string;
  state: string;
  lat: number;
  lon: number;
  baseTemp: number; // Seasonal baseline temperature (°C)
  baseWindSpeed: number; // km/h
  baseWindDir: number; // degrees (0-360)
  elevationM: number;
}

export const REGIONAL_WEATHER_STATIONS: RegionalStation[] = [
  { id: 'del', name: 'New Delhi', state: 'Delhi', lat: 28.6139, lon: 77.209, baseTemp: 32, baseWindSpeed: 14, baseWindDir: 290, elevationM: 216 },
  { id: 'bom', name: 'Mumbai', state: 'Maharashtra', lat: 19.076, lon: 72.8777, baseTemp: 29, baseWindSpeed: 18, baseWindDir: 240, elevationM: 14 },
  { id: 'blr', name: 'Bengaluru', state: 'Karnataka', lat: 12.9716, lon: 77.5946, baseTemp: 26, baseWindSpeed: 16, baseWindDir: 260, elevationM: 920 },
  { id: 'ccu', name: 'Kolkata', state: 'West Bengal', lat: 22.5726, lon: 88.3639, baseTemp: 31, baseWindSpeed: 12, baseWindDir: 170, elevationM: 9 },
  { id: 'maa', name: 'Chennai', state: 'Tamil Nadu', lat: 13.0827, lon: 80.2707, baseTemp: 33, baseWindSpeed: 20, baseWindDir: 110, elevationM: 7 },
  { id: 'hyd', name: 'Hyderabad', state: 'Telangana', lat: 17.385, lon: 78.4867, baseTemp: 30, baseWindSpeed: 15, baseWindDir: 250, elevationM: 542 },
  { id: 'amd', name: 'Ahmedabad', state: 'Gujarat', lat: 23.0225, lon: 72.5714, baseTemp: 34, baseWindSpeed: 16, baseWindDir: 230, elevationM: 53 },
  { id: 'pnq', name: 'Pune', state: 'Maharashtra', lat: 18.5204, lon: 73.8567, baseTemp: 27, baseWindSpeed: 14, baseWindDir: 250, elevationM: 560 },
  { id: 'jpr', name: 'Jaipur', state: 'Rajasthan', lat: 26.9124, lon: 75.7873, baseTemp: 35, baseWindSpeed: 12, baseWindDir: 270, elevationM: 431 },
  { id: 'lko', name: 'Lucknow', state: 'Uttar Pradesh', lat: 26.8467, lon: 80.9462, baseTemp: 32, baseWindSpeed: 10, baseWindDir: 90, elevationM: 123 },
  { id: 'pat', name: 'Patna', state: 'Bihar', lat: 25.5941, lon: 85.1376, baseTemp: 31, baseWindSpeed: 11, baseWindDir: 100, elevationM: 53 },
  { id: 'gau', name: 'Guwahati', state: 'Assam', lat: 26.1445, lon: 91.7362, baseTemp: 28, baseWindSpeed: 8, baseWindDir: 60, elevationM: 55 },
  { id: 'bho', name: 'Bhopal', state: 'Madhya Pradesh', lat: 23.2599, lon: 77.4126, baseTemp: 31, baseWindSpeed: 13, baseWindDir: 260, elevationM: 527 },
  { id: 'ixc', name: 'Chandigarh', state: 'Chandigarh', lat: 30.7333, lon: 76.7794, baseTemp: 30, baseWindSpeed: 11, baseWindDir: 310, elevationM: 321 },
  { id: 'cok', name: 'Kochi', state: 'Kerala', lat: 9.9312, lon: 76.2673, baseTemp: 28, baseWindSpeed: 17, baseWindDir: 230, elevationM: 4 },
  { id: 'sxr', name: 'Srinagar', state: 'Jammu and Kashmir', lat: 34.0837, lon: 74.7973, baseTemp: 18, baseWindSpeed: 9, baseWindDir: 330, elevationM: 1585 },
  { id: 'shl', name: 'Shimla', state: 'Himachal Pradesh', lat: 31.1048, lon: 77.1734, baseTemp: 19, baseWindSpeed: 10, baseWindDir: 320, elevationM: 2276 },
  { id: 'vns', name: 'Varanasi', state: 'Uttar Pradesh', lat: 25.3176, lon: 82.9739, baseTemp: 32, baseWindSpeed: 9, baseWindDir: 100, elevationM: 81 },
  { id: 'stv', name: 'Surat', state: 'Gujarat', lat: 21.1702, lon: 72.8311, baseTemp: 31, baseWindSpeed: 19, baseWindDir: 235, elevationM: 13 },
  { id: 'vtg', name: 'Visakhapatnam', state: 'Andhra Pradesh', lat: 17.6868, lon: 83.2185, baseTemp: 30, baseWindSpeed: 17, baseWindDir: 150, elevationM: 12 },
  { id: 'goa', name: 'Panaji', state: 'Goa', lat: 15.4909, lon: 73.8278, baseTemp: 29, baseWindSpeed: 16, baseWindDir: 245, elevationM: 7 },
  { id: 'idr', name: 'Indore', state: 'Madhya Pradesh', lat: 22.7196, lon: 75.8577, baseTemp: 30, baseWindSpeed: 14, baseWindDir: 255, elevationM: 553 },
  { id: 'ngp', name: 'Nagpur', state: 'Maharashtra', lat: 21.1458, lon: 79.0882, baseTemp: 32, baseWindSpeed: 13, baseWindDir: 260, elevationM: 310 },
  { id: 'cjb', name: 'Coimbatore', state: 'Tamil Nadu', lat: 11.0168, lon: 76.9558, baseTemp: 28, baseWindSpeed: 15, baseWindDir: 250, elevationM: 411 },
  { id: 'ded', name: 'Dehradun', state: 'Uttarakhand', lat: 30.3165, lon: 78.0322, baseTemp: 26, baseWindSpeed: 9, baseWindDir: 300, elevationM: 435 },
  { id: 'bhu', name: 'Bhubaneswar', state: 'Odisha', lat: 20.2961, lon: 85.8245, baseTemp: 31, baseWindSpeed: 14, baseWindDir: 160, elevationM: 45 },
  { id: 'trv', name: 'Thiruvananthapuram', state: 'Kerala', lat: 8.5241, lon: 76.9366, baseTemp: 29, baseWindSpeed: 16, baseWindDir: 225, elevationM: 10 },
  { id: 'ixr', name: 'Ranchi', state: 'Jharkhand', lat: 23.3441, lon: 85.3096, baseTemp: 28, baseWindSpeed: 11, baseWindDir: 120, elevationM: 651 },
  { id: 'raipur', name: 'Raipur', state: 'Chhattisgarh', lat: 21.2514, lon: 81.6296, baseTemp: 32, baseWindSpeed: 12, baseWindDir: 220, elevationM: 298 },
  { id: 'leh', name: 'Leh', state: 'Ladakh', lat: 34.1526, lon: 77.5771, baseTemp: 12, baseWindSpeed: 15, baseWindDir: 280, elevationM: 3500 },
];
