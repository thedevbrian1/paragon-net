const queryUrl = `https://${process.env.SANITY_STUDIO_PROJECT_ID}.api.sanity.io/v2022-10-20/data/query/production`;
const mutationUrl = `https://${process.env.SANITY_STUDIO_PROJECT_ID}.api.sanity.io/v2022-10-20/data/mutate/production`;

export async function getCourses() {
    let coursesQuery = `*[_type == "course"]{_id,title,mainImage{asset -> {url}},slug{current},categories[0] ->{title}}`;
    let coursesUrl = `${queryUrl}?query=${encodeURIComponent(coursesQuery)}`;
    let res = await fetch(coursesUrl);

    return res.json();
}

export async function getCourseIds() {
    let coursesQuery = `*[_type == "course"]{_id}`;
    let coursesUrl = `${queryUrl}?query=${encodeURIComponent(coursesQuery)}`;
    let res = await fetch(coursesUrl);

    return res.json();
}

export async function getCourseById(id) {
    let courseQuery = `*[_type == "course" && _id== "${id}"]{_id,title,mainImage{asset -> {url}},slug{current},categories[0] ->{title}, body}`;
    let courseUrl = `${queryUrl}?query=${encodeURIComponent(courseQuery)}`;
    let res = await fetch(courseUrl);

    return res.json();
}

export async function getCategories() {
    let categoryQuery = `*[_type == 'category']{title, _id}`;
    let categoryUrl = `${queryUrl}?query=${encodeURIComponent(categoryQuery)}`;
    let res = await fetch(categoryUrl);

    return res.json();
}

export async function getHolidayCourses() {
    let coursesQuery = `*[_type == "course" && categories -> title == "Holiday Programmes"]{_id,title,mainImage{asset -> {url}},slug{current},categories[0] ->{title}}`;
    let coursesUrl = `${queryUrl}?query=${encodeURIComponent(coursesQuery)}`;
    let res = await fetch(coursesUrl);

    return res.json();
}