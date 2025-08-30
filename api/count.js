export const config = {
  runtime: 'edge',
};

export default async function handler(request) {
  // 从请求中获取IP地址
  const ip = request.headers.get('x-forwarded-for') ||
    request.headers.get('cf-connecting-ip') ||
    'unknown';

  // 简化IP地址，只保留前两段，保护用户隐私
  const simplifiedIp = ip.split('.').slice(0, 2).join('.') + '.*.*';

  // 检查KV存储中是否存在该IP记录
  const hasVisited = await process.env.KV.get(`visitor:${simplifiedIp}`);

  // 获取当前计数
  let count = parseInt(await process.env.KV.get('page_views') || '0');

  // 如果是新访客，增加计数并记录
  if (!hasVisited) {
    count += 1;
    // 存储IP记录，设置过期时间为24小时
    await process.env.KV.set(`visitor:${simplifiedIp}`, 'true', { ex: 86400 });
    // 更新总计数
    await process.env.KV.set('page_views', count.toString());
  }

  // 返回当前计数
  return new Response(JSON.stringify({ count }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}
