import React from 'react';

export default async function orderDetail({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    return <div>ordder id:  {id}</div>
}
