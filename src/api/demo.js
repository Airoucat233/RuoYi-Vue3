import request from '@/utils/request'

export function example1() {
    return request({
        url: "/demo/example1",
        method: "get",
    });
}

export function example2() {
    return request({
        url: "/demo/example3",
        method: "get",
    });
}