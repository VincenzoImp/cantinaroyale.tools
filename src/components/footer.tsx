import { contents } from "@/app/layout";

export default function Footer() {

    var footer = contents.components.footer;

    return (
        <div className="w-full mx-auto max-w-screen-xl flex flex-col sm:flex-row justify-between items-center dark:bg-gray-800 bg-white rounded-lg m-4 p-4 shadow-lg">
            <span className="text-sm text-gray-500 sm:text-center dark:text-gray-400 mb-2 sm:mb-0">{footer.made_w_love_for} <a href={footer.cantina_royale_link} className="underline hover:text-blue-500 dark:hover:text-blue-500">{footer.cantina_royale}</a></span>
            <span className="text-sm text-gray-500 sm:text-center dark:text-gray-400">{footer.buy_me_a_coffee} <a href={footer.donation_link} className="underline hover:text-blue-500 dark:hover:text-blue-500">{footer.donation_name}</a></span>
        </div>
    );
}