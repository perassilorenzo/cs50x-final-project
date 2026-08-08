#include <cs50.h>
#include <stdio.h>

int main(void)
{
    int change;
    do
    {
        change = get_int("Change owed: ");
    }
    while (change < 0);

    int count = 0;

    while (change >= 25)
    {
        change -= 25;
        count++;
    }
    while (change >= 10)
    {
        change -= 10;
        count++;
    }
    while (change >= 5)
    {
        change -= 5;
        count++;
    }
    while (change >= 1)
    {
        change -= 1;
        count++;
    }

    printf("%i\n", count);
}