// 在Vercel项目中创建此文件: api/counter.js
export const config = {
    runtime: 'edge',
};

export default async function handler(req) {
    // 从请求头获取用户IP
    const ip = req.headers.get('x-forwarded-for') ||
        req.headers.get('x-real-ip') ||
        'unknown';

    // 连接到Vercel KV存储
    const kv = await import('@vercel/kv');

    try {
        // 增加总访问量计数
        const totalVisits = await kv.incr('total_visits');

        // 记录独立IP并获取独立IP数量
        const ipAdded = await kv.sadd('unique_ips', ip);
        const uniqueIps = await kv.scard('unique_ips');

        // 返回统计数据
        return new Response(JSON.stringify({
            totalVisits,
            uniqueIps,
            ip: ip.split(',')[0] // 取第一个IP地址
        }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    } catch (error) {
        console.error('统计错误:', error);
        return new Response(JSON.stringify({
            error: '统计失败',
            totalVisits: 0,
            uniqueIps: 0
        }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
}
