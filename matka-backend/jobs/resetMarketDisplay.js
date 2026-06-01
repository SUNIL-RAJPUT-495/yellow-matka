import Market from '../models/Market.js';
import GDMarket from '../models/GDMarket.js';


export async function resetDailyMarketDisplay() {
    const result = await Market.updateMany(
        {},
        {
            $set: {
                open_pana: '***',
                jodi_result: '**',
                close_pana: '***',
            },
        }
    );
    await GDMarket.updateMany(
        {},
        {
            $set: {
                jodi_result: '**',
            },
        }
    );
    return result;
}
