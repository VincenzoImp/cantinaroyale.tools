import { contents } from "@/app/layout";

export default function Footer() {

    const footer = contents.components.footer;

    return (
        <div className="w-full mx-auto max-w-screen-xl flex flex-col sm:flex-row justify-between items-center dark:bg-gray-800 bg-white rounded-lg m-4 p-4 shadow-lg">
            <span className="text-sm text-gray-500 sm:text-center dark:text-gray-400 mb-2 sm:mb-0">{footer.madeForText} <a href={footer.madeForLink} className="underline hover:text-blue-500 dark:hover:text-blue-500">{footer.madeForName}</a></span>
            <span className="text-sm text-gray-500 sm:text-center dark:text-gray-400">{footer.donationText} <a href={footer.donationLink} className="underline hover:text-blue-500 dark:hover:text-blue-500">{footer.donationName}</a></span>
        </div>
    );
}