// #include <iostream>
// #include <vector>
// #include <string>
// #include <memory>
// #include <unordered_map>
// #include <cstdint>

// // Defines the structure for a node in the Trie.
// struct TrieNode {
//     std::unordered_map<char, std::unique_ptr<TrieNode>> children;
//     int end_count = 0;      // Number of words ending exactly at this node.
//     int prefix_count = 0;   // Number of words that have this node's path as a prefix.
// };

// int64_t solution(const std::vector<std::string>& titles) {
//     auto root = std::make_unique<TrieNode>();
//     int64_t total_pairs = 0;

//     for (const auto& title : titles) {
//         TrieNode* node = root.get();

//         // --- COUNTING PASS (before insertion) ---
//         // This pass counts pairs where the current `title` interacts with words *already* in the Trie.

//         // 1. Count words in the Trie that are a prefix of the current `title`.
//         //    We traverse the path for `title`, and at each step, we find words that end there.
//         for (char ch : title) {
//             if (node->children.count(ch)) {
//                 node = node->children.at(ch).get();
//                 total_pairs += node->end_count;
//             } else {
//                 node = nullptr; // Path breaks, so no more prefixes can be found.
//                 break;
//             }
//         }
        
//         // At this point, `node` is either at the end of the title's path in the Trie, or it's nullptr.
//         // 2. Count words in the Trie that have the current `title` as a prefix.
//         //    (We subtract end_count to avoid double-counting identical strings).
//         if (node != nullptr) {
//             total_pairs += (node->prefix_count - node->end_count);
//         }

//         // --- INSERTION PASS ---
//         // Now, add the current `title` to the Trie for subsequent comparisons.
//         node = root.get();
//         for (char ch : title) {
//             if (!node->children.count(ch)) {
//                 node->children[ch] = std::make_unique<TrieNode>();
//             }
//             node = node->children.at(ch).get();
//             node->prefix_count++;
//         }
//         node->end_count++;
//     }

//     return total_pairs;
// }

// // Main function to test the corrected solution.
// int main() {
//     // Example 1
//     std::vector<std::string> titles1 = {"wall", "wallpaper", "science", "wallet", "philosophy", "phil", "book"};
//     std::cout << "Example 1 Output: " << solution(titles1) << std::endl; // Expected: 3

//     // Example 2
//     std::vector<std::string> titles2 = {"abc", "a", "a", "b", "ab", "ac"};
//     std::cout << "Example 2 Output: " << solution(titles2) << std::endl; // Expected: 8

//     return 0;
// }

#include<iostream>
#include<vector>
#include<string>
#include<algorithm>
using namespace std;
using int64 = long long;

int64 solution(vector<string> titles) {
    sort(titles.begin(), titles.end());
    int64 ans = 0;
    for (size_t i = 0; i < titles.size(); ++i) {
        for (size_t j = i + 1; j < titles.size(); ++j) {
            if (titles[j].compare(0, titles[i].size(), titles[i]) == 0)
                ++ans;
            else
                break;          // next titles[j] will be even “larger” – stop
        }
    }
    return ans;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n; cin >> n;
    vector<string> titles(n);
    for (auto &s : titles) cin >> s;
    cout << solution(titles) << '\n';
    return 0;
}
